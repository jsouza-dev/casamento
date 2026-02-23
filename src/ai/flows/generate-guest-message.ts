'use server';
/**
 * @fileOverview A Genkit flow for generating personalized messages for wedding guests.
 *
 * - generateGuestMessage - A function that handles the message generation process.
 * - GenerateGuestMessageInput - The input type for the generateGuestMessage function.
 * - GenerateGuestMessageOutput - The return type for the generateGuestMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGuestMessageInputSchema = z.object({
  guestName: z.string().describe('The full name of the guest.'),
  messageType: z.enum(['thank-you', 'reminder', 'general-communication']).describe('The type of message to generate.').default('general-communication'),
  rsvpStatus: z.boolean().describe('Whether the guest has confirmed their presence. True for confirmed, false otherwise.').optional(),
  numberOfAccompaniments: z.number().int().min(0).describe('The number of guests accompanying the main guest.').optional(),
  giftDetails: z.array(z.object({
    name: z.string().describe('The name of the gift item.'),
    description: z.string().describe('A brief description of the gift.'),
    value: z.number().positive().describe('The monetary value of the gift.').optional(),
  })).describe('Details of the gifts given by the guest.').optional(),
  additionalContext: z.string().describe('Any additional context or specific instructions for the message.').optional(),
});

export type GenerateGuestMessageInput = z.infer<typeof GenerateGuestMessageInputSchema>;

const GenerateGuestMessageOutputSchema = z.object({
  message: z.string().describe('The personalized message for the guest.'),
});

export type GenerateGuestMessageOutput = z.infer<typeof GenerateGuestMessageOutputSchema>;

export async function generateGuestMessage(input: GenerateGuestMessageInput): Promise<GenerateGuestMessageOutput> {
  return generateGuestMessageFlow(input);
}

const generateGuestMessagePrompt = ai.definePrompt({
  name: 'generateGuestMessagePrompt',
  input: { schema: GenerateGuestMessageInputSchema },
  output: { schema: GenerateGuestMessageOutputSchema },
  prompt: `You are an AI assistant for a newlywed couple, Felipe Augusto and Rayssa Caldeira. Your task is to draft heartfelt, elegant, romantic, and delicate personalized messages for their wedding guests in Portuguese (Brazil).

Avoid any institutional or corporate tone. The messages should feel intimate and personal, as if written directly by the couple.

Guest Name: {{{guestName}}}
Message Type: {{{messageType}}}

Consider the following details:

{{#if rsvpStatus}}
  Presença confirmada: Sim
  {{#if numberOfAccompaniments}}
    Número de acompanhantes: {{{numberOfAccompaniments}}}
  {{/if}}
{{else}}
  Presença confirmada: Não
{{/if}}

{{#if giftDetails}}
  Presentes recebidos:
  {{#each giftDetails}}
    - {{{name}}} ({{{description}}}){{#if value}} (Valor: R$ {{{value}}}){{/if}}
  {{/each}}
{{/if}}

{{#if additionalContext}}
  Contexto adicional: {{{additionalContext}}}
{{/if}}

Based on the information above, please draft a personalized message in Portuguese for {{{guestName}}}. The message should reflect the '{{messageType}}' type. Ensure the tone is warm, personal, and expresses gratitude or relevant information naturally. Focus on making the guest feel valued and loved.

Here are some examples of expected message types:
- 'thank-you': Express sincere gratitude for their presence and/or gift, mentioning the gift specifically if provided.
- 'reminder': Gently remind them about an upcoming date or action, perhaps relating to the RSVP.
- 'general-communication': A warm, general message to the guest.
`,
});

const generateGuestMessageFlow = ai.defineFlow(
  {
    name: 'generateGuestMessageFlow',
    inputSchema: GenerateGuestMessageInputSchema,
    outputSchema: GenerateGuestMessageOutputSchema,
  },
  async (input) => {
    const { output } = await generateGuestMessagePrompt(input);
    return output!;
  }
);
