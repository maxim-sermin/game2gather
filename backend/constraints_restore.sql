ALTER TABLE public.games ADD CONSTRAINT games_genre_fk FOREIGN KEY (genre_fk) REFERENCES public.genre(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.games ADD CONSTRAINT games_user_created_fk FOREIGN KEY (created_by_user_fk) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.scores ADD CONSTRAINT scores_game_fk FOREIGN KEY (scored_game_fk) REFERENCES public.games(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.scores ADD CONSTRAINT scores_user_fk FOREIGN KEY (scored_by_user_fk) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;