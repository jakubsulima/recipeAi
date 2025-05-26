package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.CredentialsDto;
import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.UserMapper;
import org.jakub.backendapi.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.CharBuffer;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private final String testEmail = "john@example.com";
    private final String unknownEmail = "unknown@example.com";
    private final String newEmail = "newuser@example.com";
    private final String existingEmail = "existinguser@example.com";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByEmail_UserExists() {
        User user = User.builder()
                .email(testEmail)
                .password("hashedPassword")
                .build();

        UserDto userDto = UserDto.builder()
                .email(testEmail)
                .build();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(user));
        when(userMapper.toUserDto(user)).thenReturn(userDto);

        UserDto result = userService.findByEmail(testEmail);

        assertEquals(testEmail, result.getEmail());
        verify(userRepository).findByEmail(testEmail);
        verify(userMapper).toUserDto(user);
    }

    @Test
    void testFindByEmail_UserNotFound() {
        when(userRepository.findByEmail(unknownEmail)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> userService.findByEmail(unknownEmail));
        assertEquals("Unknown user", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }

    @Test
    void testLogin_Success() {
        CredentialsDto credentials = new CredentialsDto(testEmail, "password".toCharArray());

        User user = User.builder()
                .email(testEmail)
                .password("hashedPassword")
                .build();

        UserDto userDto = UserDto.builder()
                .email(testEmail)
                .build();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(CharBuffer.wrap(credentials.getPassword()), "hashedPassword")).thenReturn(true); // Use getPassword()
        when(userMapper.toUserDto(user)).thenReturn(userDto);

        UserDto result = userService.login(credentials);

        assertEquals(testEmail, result.getEmail());
        verify(userRepository).findByEmail(testEmail);
        verify(passwordEncoder).matches(any(CharBuffer.class), eq("hashedPassword"));
        verify(userMapper).toUserDto(user);
    }

    @Test
    void testLogin_InvalidPassword() {
        CredentialsDto credentials = new CredentialsDto(testEmail, "wrongpass".toCharArray());

        User user = User.builder()
                .email(testEmail)
                .password("hashedPassword")
                .build();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(CharBuffer.wrap(credentials.getPassword()), "hashedPassword")).thenReturn(false); // Use getPassword()

        AppException ex = assertThrows(AppException.class, () -> userService.login(credentials));
        assertEquals("Invalid password", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }

    @Test
    void testLogin_UserNotFound() {
        CredentialsDto credentials = new CredentialsDto(unknownEmail, "password".toCharArray());

        when(userRepository.findByEmail(unknownEmail)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> userService.login(credentials));
        assertEquals("Unknown user", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }

    @Test
    void testRegister_Success() {
        SignUpDto signUpDto = SignUpDto.builder()
                .email(newEmail)
                .password("mypassword".toCharArray())
                .build();

        User mappedUser = User.builder()
                .email(newEmail)
                .build();

        User savedUser = User.builder()
                .id(1L)
                .email(newEmail)
                .password("encodedPassword")
                .build();

        UserDto expectedDto = UserDto.builder()
                .id(1L)
                .email(newEmail)
                .build();

        when(userRepository.findByEmail(newEmail)).thenReturn(Optional.empty());
        when(userMapper.signUpToUser(signUpDto)).thenReturn(mappedUser);
        when(passwordEncoder.encode(CharBuffer.wrap(signUpDto.getPassword()))).thenReturn("encodedPassword");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User userBeingSaved = invocation.getArgument(0);
            return User.builder()
                    .id(1L)
                    .email(userBeingSaved.getEmail())
                    .password(userBeingSaved.getPassword())
                    .build();
        });

        when(userRepository.save(argThat(user -> newEmail.equals(user.getEmail())))).thenReturn(savedUser);
        when(userMapper.toUserDto(savedUser)).thenReturn(expectedDto);

        UserDto result = userService.register(signUpDto);

        assertNotNull(result);
        assertEquals(newEmail, result.getEmail());
        verify(userRepository).findByEmail(newEmail);
        verify(userMapper).signUpToUser(signUpDto);
        verify(passwordEncoder).encode(CharBuffer.wrap(signUpDto.getPassword()));
        verify(userRepository).save(argThat(user -> newEmail.equals(user.getEmail()) && "encodedPassword".equals(user.getPassword())));
        verify(userMapper).toUserDto(savedUser);
    }

    @Test
    void testRegister_UserAlreadyExists() {
        SignUpDto signUpDto = SignUpDto.builder()
                .email(existingEmail)
                .password("password123".toCharArray())
                .build();

        User existingUserEntity = User.builder()
                .email(existingEmail)
                .build();

        when(userRepository.findByEmail(existingEmail)).thenReturn(Optional.of(existingUserEntity));

        AppException ex = assertThrows(AppException.class, () -> userService.register(signUpDto));
        assertEquals("User already exists", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }
}
