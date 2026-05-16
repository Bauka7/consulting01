package next.gen.consulting.util;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class PhoneNormalizer {

    private PhoneNormalizer() {
    }

    public static String compact(String phone) {
        if (phone == null) {
            return null;
        }

        return phone.replaceAll("[\\s\\-().]+", "");
    }

    public static String normalizeForStorage(String phone) {
        String compactPhone = compact(phone);
        if (compactPhone == null || compactPhone.isBlank()) {
            return compactPhone;
        }

        if (compactPhone.matches("^\\+7\\d{10}$")) {
            return compactPhone;
        }

        if (compactPhone.matches("^7\\d{10}$")) {
            return "+" + compactPhone;
        }

        if (compactPhone.matches("^8\\d{10}$")) {
            return "+7" + compactPhone.substring(1);
        }

        if (compactPhone.matches("^\\d{10}$")) {
            return "+7" + compactPhone;
        }

        return compactPhone;
    }

    public static List<String> buildLookupCandidates(String phone) {
        String compactPhone = compact(phone);
        if (compactPhone == null || compactPhone.isBlank()) {
            return List.of();
        }

        Set<String> candidates = new LinkedHashSet<>();
        candidates.add(compactPhone);

        String normalizedPhone = normalizeForStorage(compactPhone);
        if (normalizedPhone != null && !normalizedPhone.isBlank()) {
            candidates.add(normalizedPhone);
        }

        String localDigits = extractLocalDigits(compactPhone);
        if (localDigits != null) {
            candidates.add(localDigits);
            candidates.add("7" + localDigits);
            candidates.add("8" + localDigits);
            candidates.add("+7" + localDigits);
        }

        return List.copyOf(candidates);
    }

    private static String extractLocalDigits(String phone) {
        String compactPhone = compact(phone);
        if (compactPhone == null || compactPhone.isBlank()) {
            return null;
        }

        if (compactPhone.matches("^\\+7\\d{10}$")) {
            return compactPhone.substring(2);
        }

        if (compactPhone.matches("^[78]\\d{10}$")) {
            return compactPhone.substring(1);
        }

        if (compactPhone.matches("^\\d{10}$")) {
            return compactPhone;
        }

        return null;
    }
}
