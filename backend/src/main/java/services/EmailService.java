package services;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        System.out.println("MOCK EMAIL SENT TO: " + toEmail);
        System.out.println("RESET LINK: " + resetLink);
    }

    public void sendPharmacyApprovalEmail(String toEmail, boolean approved) {
        if (approved) {
            System.out.println("=== APPROVAL EMAIL ===");
            System.out.println("TO: " + toEmail);
            System.out.println("SUBJECT: Your Pharmacy Account Has Been Approved");
            System.out.println("BODY: Your pharmacy account has been approved! You can now login to PharmaSeek.");
        } else {
            System.out.println("=== REJECTION EMAIL ===");
            System.out.println("TO: " + toEmail);
            System.out.println("SUBJECT: Your Pharmacy Account Request Was Rejected");
            System.out.println("BODY: Your pharmacy account request was rejected. Please contact support for more information.");
        }
    }
}
