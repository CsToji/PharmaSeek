package exceptions;

public class ReservationNotFoundException extends RuntimeException {
    public ReservationNotFoundException(Long reservationId) {
        super("Reservation not found with id: " + reservationId);
    }
}

