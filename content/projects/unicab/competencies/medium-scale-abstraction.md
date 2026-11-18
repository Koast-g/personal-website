---
title: "Medium-scale abstraction"
kind: "UniCab · CSC-324 · Basic · Development"
---

## The code

### Public function `respond_to_booking`

It checks who is calling, locks the booking and the ride (`for update`), and then hands the seat logic to two private helpers: `assert_seats_free` checks that each leg has room, and `shift_booking_seats` is the only code that changes seat counts and the ride's status.

```sql {linenos=inline,linenostart=382}
create or replace function public.respond_to_booking(p_booking_id uuid, p_accept boolean)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.bookings;
  r public.rides;
begin
  select * into b from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;

  select * into r from public.rides where id = b.ride_id for update;
  if r.creator_id is distinct from auth.uid() then
    raise exception 'Only the ride creator can respond to requests' using errcode = '42501';
  end if;
  if b.status <> 'pending' then
    raise exception 'This request has already been handled';
  end if;

  if not p_accept then
    update public.bookings set status = 'declined' where id = b.id returning * into b;
    return b;
  end if;

  if r.status <> 'open' then
    raise exception 'This ride is no longer open';
  end if;
  perform public.assert_seats_free(r, b.legs, b.seats);
  perform public.shift_booking_seats(b, 1);

  update public.bookings set status = 'accepted' where id = b.id returning * into b;
  return b;
end;
$$;
```

### Code snippet on the app's side

```swift {linenos=inline,linenostart=159}
/// Accept (`true`) or decline (`false`) a request. Only the ride's
/// poster is allowed to; the database enforces it.
func respond(to bookingId: UUID, accept: Bool) async throws {
    nonisolated struct Params: Encodable {
        let p_booking_id: UUID
        let p_accept: Bool
    }
    try await client
        .rpc("respond_to_booking", params: Params(p_booking_id: bookingId, p_accept: accept))
        .execute()
}
```

## How this sample shows medium-scale abstraction

One of the essential features of our app is the ability to book rides. Behind the scenes, our database is responsible for checking every rule before allowing students to register a seat for the ride. It checks whether the ride exists, whether the ride is still open, counts seats separately for each leg of a round trip, and ensures that two people don’t book the last available seat at the same time.

Architecturally, the feature of booking rides follows a client-server pattern. There is a clear separation between the front end and the backend (instead of having the app handle the booking logic, it calls backend functions such as requesting a seat or accepting a booking). The backend, implemented in PostgreSQL through database functions and migrations, handles the actual logic.

The majority of the back-end functions are broken down into smaller helper functions in order to create reusability and readability. For instance, the public functions `request_booking` and `respond_to_booking` call private helper functions: `assert_can_request` checks whether a student is allowed to request a seat, `assert_seats_free` verifies seat availability, and `shift_booking_seats` handles changes to seat counts. These helper functions, as said earlier, are private, meaning that they cannot be called directly by the front end. Instead, the public functions coordinate them to complete a booking operation.

Our architecture also prevents challenges of simultaneous booking (when multiple students interact with the same ride). The database uses row-level locking (`SELECT ... FOR UPDATE`) to ensure that two booking operations cannot modify the same ride at the same time. This prevents situations where more students are accepted than there are available seats.
