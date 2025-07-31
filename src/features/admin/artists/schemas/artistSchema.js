import { z } from "zod";

export const artistSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  bio: z.string().min(10, "La bio doit faire au moins 10 caractères").optional(),
  artistImageUrl: z.string().url("URL d'image invalide").optional(),
  websiteUrl: z.string().url("URL de site web invalide").optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(2, "Plateforme requise"),
      url: z.string().url("URL invalide"),
    })
  ).optional(),
  emailingProvider: z.enum(["Mailchimp", "Brevo", "Mailjet", "Autre"]).optional(),
  newsletterEmail: z.string().email("Email de newsletter invalide").optional(),
}); 