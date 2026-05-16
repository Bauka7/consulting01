package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.model.User;
import next.gen.consulting.repository.UserRepository;
import next.gen.consulting.util.PhoneNormalizer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public CustomUserPrincipal loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalized = PhoneNormalizer.normalizeForStorage(username);
        var candidates = PhoneNormalizer.buildLookupCandidates(username);
        User user = userRepository.findFirstByPhoneIn(candidates)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + normalized));

        return new CustomUserPrincipal(
                user.getId(),
                user.getPhone(),
                user.getPasswordHash(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
}
