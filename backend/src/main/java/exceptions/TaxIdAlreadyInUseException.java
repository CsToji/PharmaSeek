package exceptions;

public class TaxIdAlreadyInUseException extends RuntimeException {
    public TaxIdAlreadyInUseException() {
        super("Matricule Fiscale already in use");
    }
}

