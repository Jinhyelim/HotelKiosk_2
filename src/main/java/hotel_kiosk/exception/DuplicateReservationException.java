package hotel_kiosk.exception;

public class DuplicateReservationException extends RuntimeException {
    public DuplicateReservationException(int roomNo) {
        super(roomNo + "호" + " 이미 예약된 객실입니다.");
    }
}
