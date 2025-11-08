import { z } from 'zod';

export const pollCreatedSchema = z.object({
    poll_id: z.string(),
    creator_key: z.string(),
    question: z.string(),
    active_until: z.coerce.date(),
    expire_at: z.coerce.date(),
});

// Schema for a single option
const optionSchema = z.object({
    id: z.string(),
    text: z.string(),
});

// Schema for the full poll results response
export const pollResultsSchema = z.object({
    poll_id: z.string(),
    question: z.string(),
    options: z.array(optionSchema),
    allow_multiple_choices: z.boolean(),
    theme: z.string(),

    active_until: z.coerce.date(),
    expire_at: z.coerce.date(),

    public_results: z.boolean(),
    votes: z.record(z.string(), z.number()),
});

export const pollPublicSchema = pollResultsSchema.omit({ votes: true });

// Schema for the successful vote response
export const voteSuccessSchema = z.object({
    message: z.string(),
});

// Schema for successful responses that have an empty data body
// Used for the response in the poll deletion route
export const emptySuccessSchema = z.any().transform(() => true);