import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdAccount, Campaign } from '../types/auth';
import { metaAdsService } from '../services/metaAdsService';

interface AdsState {
  // State
  adAccounts: AdAccount[];
  campaigns: Campaign[];
  selectedAccount: AdAccount | null;
  isLoading: boolean;
  error: string | null;
  
  // Metrics aggregés
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgCPM: number;
  avgROAS: number;
}

interface AdsStore extends AdsState {
  // Actions
  connectMetaAccount: (accessToken: string) => Promise<void>;
  disconnectAccount: (accountId: string) => void;
  selectAccount: (account: AdAccount | null) => void;
  refreshCampaigns: (accountId?: string) => Promise<void>;
  createCampaign: (campaignData: any) => Promise<Campaign>;
  updateCampaignStatus: (campaignId: string, status: 'active' | 'paused') => Promise<void>;
  calculateMetrics: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AdsState = {
  adAccounts: [],
  campaigns: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
  totalSpend: 0,
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  avgCTR: 0,
  avgCPM: 0,
  avgROAS: 0,
};

export const useAdsStore = create<AdsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      connectMetaAccount: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const accounts = await metaAdsService.getAdAccounts(accessToken);
          
          set(state => ({
            adAccounts: [
              ...state.adAccounts.filter(acc => acc.platform !== 'meta'),
              ...accounts
            ],
            isLoading: false,
          }));

          // Auto-sélectionner le premier compte si aucun n'est sélectionné
          const { selectedAccount } = get();
          if (!selectedAccount && accounts.length > 0) {
            get().selectAccount(accounts[0]);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur de connexion Meta Ads',
            isLoading: false,
          });
          throw error;
        }
      },

      disconnectAccount: (accountId: string) => {
        set(state => {
          const newAccounts = state.adAccounts.filter(acc => acc.id !== accountId);
          const newCampaigns = state.campaigns.filter(camp => camp.accountId !== accountId);
          
          return {
            adAccounts: newAccounts,
            campaigns: newCampaigns,
            selectedAccount: state.selectedAccount?.id === accountId ? null : state.selectedAccount,
          };
        });
        get().calculateMetrics();
      },

      selectAccount: (account: AdAccount | null) => {
        set({ selectedAccount: account });
        if (account) {
          get().refreshCampaigns(account.id);
        }
      },

      refreshCampaigns: async (accountId?: string) => {
        const { selectedAccount, adAccounts } = get();
        const targetAccount = accountId 
          ? adAccounts.find(acc => acc.id === accountId)
          : selectedAccount;

        if (!targetAccount) return;

        set({ isLoading: true, error: null });
        try {
          let campaigns: Campaign[] = [];

          if (targetAccount.platform === 'meta') {
            campaigns = await metaAdsService.getCampaigns(
              targetAccount.accountId,
              targetAccount.accessToken
            );
          }

          set(state => ({
            campaigns: [
              ...state.campaigns.filter(camp => camp.accountId !== targetAccount.id),
              ...campaigns
            ],
            isLoading: false,
          }));

          get().calculateMetrics();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur de récupération des campagnes',
            isLoading: false,
          });
        }
      },

      createCampaign: async (campaignData: any) => {
        const { selectedAccount } = get();
        if (!selectedAccount) {
          throw new Error('Aucun compte sélectionné');
        }

        set({ isLoading: true, error: null });
        try {
          let campaign: Campaign;

          if (selectedAccount.platform === 'meta') {
            campaign = await metaAdsService.createCampaign(
              selectedAccount.accountId,
              selectedAccount.accessToken,
              { ...campaignData, accountId: selectedAccount.id }
            );
          } else {
            throw new Error('Plateforme non supportée');
          }

          set(state => ({
            campaigns: [...state.campaigns, campaign],
            isLoading: false,
          }));

          get().calculateMetrics();
          return campaign;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur de création de campagne',
            isLoading: false,
          });
          throw error;
        }
      },

      updateCampaignStatus: async (campaignId: string, status: 'active' | 'paused') => {
        const { campaigns, adAccounts } = get();
        const campaign = campaigns.find(c => c.id === campaignId);
        const account = campaign ? adAccounts.find(acc => acc.id === campaign.accountId) : null;

        if (!campaign || !account) {
          throw new Error('Campagne ou compte introuvable');
        }

        set({ isLoading: true, error: null });
        try {
          if (account.platform === 'meta') {
            const metaStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
            await metaAdsService.updateCampaignStatus(
              campaignId,
              account.accessToken,
              metaStatus
            );
          }

          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === campaignId ? { ...c, status } : c
            ),
            isLoading: false,
          }));

          get().calculateMetrics();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur de mise à jour',
            isLoading: false,
          });
          throw error;
        }
      },

      calculateMetrics: () => {
        const { campaigns } = get();
        
        if (campaigns.length === 0) {
          set({
            totalSpend: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0,
            avgCTR: 0,
            avgCPM: 0,
            avgROAS: 0,
          });
          return;
        }

        const totals = campaigns.reduce(
          (acc, campaign) => ({
            spend: acc.spend + campaign.budget.spent,
            impressions: acc.impressions + campaign.metrics.impressions,
            clicks: acc.clicks + campaign.metrics.clicks,
            conversions: acc.conversions + campaign.metrics.conversions,
            ctr: acc.ctr + campaign.metrics.ctr,
            cpm: acc.cpm + campaign.metrics.cpm,
            roas: acc.roas + campaign.metrics.roas,
          }),
          { spend: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpm: 0, roas: 0 }
        );

        set({
          totalSpend: totals.spend,
          totalImpressions: totals.impressions,
          totalClicks: totals.clicks,
          totalConversions: totals.conversions,
          avgCTR: totals.ctr / campaigns.length,
          avgCPM: totals.cpm / campaigns.length,
          avgROAS: totals.roas / campaigns.length,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'mdmc-ads-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adAccounts: state.adAccounts,
        campaigns: state.campaigns,
        selectedAccount: state.selectedAccount,
      }),
    }
  )
);

// Hook pour initialiser les métriques au chargement
export const useAdsInit = () => {
  const calculateMetrics = useAdsStore((state) => state.calculateMetrics);
  const adAccounts = useAdsStore((state) => state.adAccounts);
  
  // Calculer les métriques au chargement si on a des données
  React.useEffect(() => {
    if (adAccounts.length > 0) {
      calculateMetrics();
    }
  }, [calculateMetrics, adAccounts.length]);
};