revoke all on function public.can_read_room_image(text) from anon;
revoke all on function public.can_mutate_room_image(text) from anon;
grant execute on function public.can_read_room_image(text) to authenticated;
grant execute on function public.can_mutate_room_image(text) to authenticated;;
