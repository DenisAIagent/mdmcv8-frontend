#!/usr/bin/env node

// MDMC SmartLinks - Script d'initialisation d'un utilisateur administrateur
// Usage: node scripts/setup-admin.js

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

console.log('🎵 MDMC SmartLinks - Initialisation Admin');
console.log('==========================================');

async function createAdminUser() {
  try {
    // Génération des identifiants par défaut
    const defaultCredentials = {
      username: 'mdmc_admin',
      password: 'MDMC2025!',
      role: 'admin',
      permissions: ['create', 'edit', 'delete', 'analytics', 'admin']
    };

    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultCredentials.password, saltRounds);

    // Création de l'objet utilisateur
    const adminUser = {
      _id: 'mdmc_admin_001',
      username: defaultCredentials.username,
      password: hashedPassword,
      role: defaultCredentials.role,
      permissions: defaultCredentials.permissions,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    // Sauvegarde dans un fichier JSON temporaire
    const adminFilePath = path.join(__dirname, 'admin-user.json');
    fs.writeFileSync(adminFilePath, JSON.stringify(adminUser, null, 2));

    console.log('✅ Utilisateur administrateur créé avec succès !');
    console.log('');
    console.log('🔐 IDENTIFIANTS D\'ACCÈS :');
    console.log('========================');
    console.log(`👤 Nom d'utilisateur: ${defaultCredentials.username}`);
    console.log(`🔑 Mot de passe:      ${defaultCredentials.password}`);
    console.log(`🎯 Rôle:             ${defaultCredentials.role}`);
    console.log('');
    console.log('💾 Données sauvegardées dans: scripts/admin-user.json');
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('- Changez le mot de passe après la première connexion');
    console.log('- En production, utilisez des mots de passe plus complexes');
    console.log('- Supprimez le fichier admin-user.json après import en base');
    console.log('');
    console.log('🔗 Pour tester: https://smartlink.mdmcmusicads.com/login');

    return adminUser;

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error.message);
    process.exit(1);
  }
}

// Fonction pour créer des utilisateurs de test supplémentaires
async function createTestUsers() {
  const testUsers = [];
  
  const users = [
    { username: 'mdmc_client', password: 'Client2025!', role: 'client' },
    { username: 'mdmc_demo', password: 'Demo2025!', role: 'client' }
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = {
      _id: `${userData.username}_001`,
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      permissions: userData.role === 'admin' ? 
        ['create', 'edit', 'delete', 'analytics', 'admin'] : 
        ['create', 'edit', 'analytics'],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    testUsers.push({
      user,
      plainPassword: userData.password
    });
  }

  // Sauvegarde des utilisateurs de test
  const testFilePath = path.join(__dirname, 'test-users.json');
  fs.writeFileSync(testFilePath, JSON.stringify({
    users: testUsers.map(u => u.user),
    credentials: testUsers.map(u => ({
      username: u.user.username,
      password: u.plainPassword,
      role: u.user.role
    }))
  }, null, 2));

  console.log('👥 UTILISATEURS DE TEST CRÉÉS :');
  console.log('===============================');
  testUsers.forEach(({ user, plainPassword }) => {
    console.log(`👤 ${user.username} / ${plainPassword} (${user.role})`);
  });
  console.log('');
  console.log('💾 Données sauvegardées dans: scripts/test-users.json');

  return testUsers;
}

// Script principal
async function main() {
  console.log('Création de l\'utilisateur administrateur...');
  const adminUser = await createAdminUser();
  
  console.log('');
  console.log('Création des utilisateurs de test...');
  const testUsers = await createTestUsers();

  console.log('');
  console.log('🚀 CONFIGURATION TERMINÉE !');
  console.log('');
  console.log('📋 PROCHAINES ÉTAPES :');
  console.log('1. Connectez-vous avec les identifiants admin');
  console.log('2. Testez la création d\'un SmartLink');
  console.log('3. Vérifiez le dashboard et les analytics');
  console.log('4. En production : configurez MongoDB et importez les utilisateurs');
  console.log('');
  console.log('💡 Pour intégrer MongoDB plus tard :');
  console.log('   - Installez MongoDB et configurez la connexion');
  console.log('   - Importez les données depuis les fichiers JSON');
  console.log('   - Activez la persistance en base dans routes/auth.js');
}

// Exécution du script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAdminUser, createTestUsers };