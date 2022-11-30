ALTER TABLE public.games DROP CONSTRAINT games_genre_fk;
ALTER TABLE public.games DROP CONSTRAINT games_user_created_fk;

ALTER TABLE public.scores DROP CONSTRAINT scores_game_fk;
ALTER TABLE public.scores DROP CONSTRAINT scores_user_fk;