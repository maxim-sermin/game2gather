package com.gamers.game2gatherbackend.api;

import com.gamers.game2gatherbackend.model.User;
import com.gamers.game2gatherbackend.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(path = "/")
@Tag(name = "User Endpoint", description = "Endpoint for interacting with users")
public class UserEndpoint {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(UserEndpoint.class);

    private static final String ADMIN_ROLE_NAME = "ROLE_ADMIN";

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRegistry sessionRegistry;

    @PostConstruct
    public void createInitialUser() {
        if (userRepository.findAll().isEmpty()) { // strictly speaking not necessary, leaving for clarity of intent
            String startCreds = "initialChangeMe";
            User initialUser = new User();
            initialUser.setUsername(startCreds);
            initialUser.setPassword(startCreds);
            saveNewUser(initialUser, true);
        }
    }

    @Operation(summary = "Login with token")
    @PostMapping(path = "/login", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE}, produces = {MediaType.TEXT_HTML_VALUE})
    public void swaggerLogin(@RequestBody UserLogin userLogin) {
        throw new IllegalStateException("This method shouldn't be called, it is only required for Swagger. It's implemented by Spring Security filters.");
    }

    @Operation(summary = "Logout")
    @PostMapping("/logout")
    public void swaggerLogout() {
        throw new IllegalStateException("This method shouldn't be called, it is only required for Swagger. It's implemented by Spring Security filters.");
    }

    @GetMapping("checkSession")
    public ResponseEntity<String> checkSession() {
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Register new user account")
    @PostMapping("register")
    public ResponseEntity<String> registerUser(@RequestBody User newUser) {
        Optional<User> saved = saveNewUser(newUser, isCurrentUserAdmin() && ADMIN_ROLE_NAME.equals(newUser.getRole()));

        if (saved.isEmpty()) {
            return new ResponseEntity<>(String.format("Username '%s' is already taken", newUser.getUsername()), HttpStatus.CONFLICT);
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/username")
    public ResponseEntity<String> updateUsername(@Parameter(hidden = true) Principal principal, @RequestBody String newUsername) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        if (userOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<User> checkIfNameFree = userRepository.findByUsername(newUsername);
        if (checkIfNameFree.isPresent()) {
            return new ResponseEntity<>(String.format("Username '%s' is already taken", newUsername), HttpStatus.CONFLICT);
        }

        User user = userOptional.get();

        user.setUsername(newUsername);
        userRepository.save(user);

        // somewhat hacky: updates the username in Spring Security so subsequent 'principal.getName()' return the new value
        Collection<SimpleGrantedAuthority> nowAuthorities =
                (Collection<SimpleGrantedAuthority>) SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getAuthorities();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), nowAuthorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return ResponseEntity.ok("Successfully updated username");
    }

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(@Parameter(hidden = true) Principal principal, @RequestBody String newPassword) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        return checkAndUpdatePassword(userOptional, newPassword);
    }

    @PutMapping("/password/{id}")
    public ResponseEntity<String> updateOtherPassword(@PathVariable("id") Long id, @RequestBody String newPassword) {
        if (!isCurrentUserAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<User> userOptional = userRepository.findById(id);
        return checkAndUpdatePassword(userOptional, newPassword);
    }

    private ResponseEntity<String> checkAndUpdatePassword(Optional<User> userOptional, String newPassword) {
        if (userOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Successfully updated password");
    }

    @GetMapping(value = "details", produces = "application/json")
    public ResponseEntity<User> getUserDetails(@Parameter(hidden = true) Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        if (userOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();

        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping(value = "sessions", produces = "application/json")
    public ResponseEntity<List<UserSession>> getAllSessions() {
        if (!isCurrentUserAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<UserSession> sessions = new ArrayList<>();

        for (Object user : sessionRegistry.getAllPrincipals()) {
            List<SessionInformation> sessionsOfUser = sessionRegistry.getAllSessions(user, false);

            if (sessionsOfUser.size() > 0) {
                UserSession userSession = new UserSession();
                userSession.username = ((org.springframework.security.core.userdetails.User) user).getUsername();
                userSession.lastUsed = new ArrayList<>();
                for (SessionInformation session : sessionsOfUser) {
                    userSession.lastUsed.add(session.getLastRequest());
                }
                sessions.add(userSession);
            }
        }

        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("sessions")
    public ResponseEntity<String> deleteAllSessions() {
        if (!isCurrentUserAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        for (Object user : sessionRegistry.getAllPrincipals()) {
            for (SessionInformation session : sessionRegistry.getAllSessions(user, false)) {
                session.expireNow();
            }
        }
        return ResponseEntity.ok("Logged everybody out");
    }

    @GetMapping(value = "/users", produces = "application/json")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAllByOrderByUsername());
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAccount(@Parameter(hidden = true) Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        return checkAndDeleteAccount(userOptional);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOtherAccount(@PathVariable("id") Long id) {
        if (!isCurrentUserAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<User> userOptional = userRepository.findById(id);
        return checkAndDeleteAccount(userOptional);
    }

    private ResponseEntity<String> checkAndDeleteAccount(Optional<User> userOptional) {
        if (userOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        userRepository.delete(user);

        return ResponseEntity.ok("Successfully deleted account");
    }

    public static boolean isCurrentUserAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().
                anyMatch(r -> r.getAuthority().equals(ADMIN_ROLE_NAME));
    }

    private Optional<User> saveNewUser(User newUser, boolean makeAdmin) {
        Optional<User> user = userRepository.findByUsername(newUser.getUsername());

        if (user.isPresent()) {
            logger.warn("Tried to register user with name {} which already exists", newUser.getUsername());
            return Optional.empty();
        }

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setEnabled(true);
        newUser.setRole(makeAdmin ? ADMIN_ROLE_NAME : "ROLE_USER"); // can probably also be some other text

        return Optional.of(userRepository.save(newUser));
    }

    public static class UserLogin {
        public String username;
        public String password;
    }

    public static class UserSession {
        public String username;
        public List<Date> lastUsed;
    }
}
