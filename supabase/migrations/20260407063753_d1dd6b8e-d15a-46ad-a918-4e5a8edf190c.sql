ALTER TABLE public.challenges ADD COLUMN category text NOT NULL DEFAULT 'SQL';

UPDATE public.challenges SET category = 'SQL' WHERE category = 'SQL';