package exceptions;

public class CinAlreadyInUseException extends RuntimeException {
    public CinAlreadyInUseException() {
        super("CIN already in use");
    }
}

