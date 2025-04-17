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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByLogin_UserExists() {
        User user = User.builder()
                .login("john")
                .firstName("John")
                .lastName("Doe")
                .build();

        UserDto userDto = UserDto.builder()
                .login("john")
                .firstName("John")
                .lastName("Doe")
                .build();

        when(userRepository.findByLogin("john")).thenReturn(Optional.of(user));
        when(userMapper.toUserDto(user)).thenReturn(userDto);

        UserDto result = userService.findByLogin("john");

        assertEquals("john", result.getLogin());
        verify(userRepository).findByLogin("john");
        verify(userMapper).toUserDto(user);
    }

    @Test
    void testFindByLogin_UserNotFound() {
        when(userRepository.findByLogin("unknown")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> userService.findByLogin("unknown"));
        assertEquals("Error: Unknown user (HTTP 404)", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }

    @Test
    void testLogin_Success() {
        CredentialsDto credentials = new CredentialsDto("john", "password");

        User user = User.builder()
                .login("john")
                .password("hashedPassword")
                .build();

        UserDto userDto = UserDto.builder()
                .login("john")
                .build();

        when(userRepository.findByLogin("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(CharBuffer.wrap("password"), "hashedPassword")).thenReturn(true);
        when(userMapper.toUserDto(user)).thenReturn(userDto);

        UserDto result = userService.login(credentials);

        assertEquals("john", result.getLogin());
        verify(userRepository).findByLogin("john");
        verify(passwordEncoder).matches(any(), eq("hashedPassword"));
        verify(userMapper).toUserDto(user);
    }

    @Test
    void testLogin_InvalidPassword() {
        CredentialsDto credentials = new CredentialsDto("john", "wrongpass");

        User user = User.builder()
                .login("john")
                .password("hashedPassword")
                .build();

        when(userRepository.findByLogin("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(CharBuffer.wrap("wrongpass"), "hashedPassword")).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () -> userService.login(credentials));
        assertEquals("Error: Invalid password (HTTP 400)", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }

    @Test
    void testLogin_UserNotFound() {
        CredentialsDto credentials = new CredentialsDto("nonexistent", "password");

        when(userRepository.findByLogin("nonexistent")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> userService.login(credentials));
        assertEquals("Error: Unknown user (HTTP 404)", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }

    @Test
    void testRegister_Success() {
        SignUpDto signUpDto = SignUpDto.builder()
                .login("newuser")
                .firstName("Jane")
                .lastName("Doe")
                .password("mypassword".toCharArray())
                .build();

        User mappedUser = User.builder()
                .login("newuser")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        User savedUser = User.builder()
                .id(1L)
                .login("newuser")
                .firstName("Jane")
                .lastName("Doe")
                .password("encodedPassword")
                .build();

        UserDto expectedDto = UserDto.builder()
                .id(1L)
                .login("newuser")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        when(userRepository.findByLogin("newuser")).thenReturn(Optional.empty());
        when(userMapper.signUpToUser(signUpDto)).thenReturn(mappedUser);
        when(passwordEncoder.encode(CharBuffer.wrap(signUpDto.getPassword()))).thenReturn("encodedPassword");
        when(userRepository.save(mappedUser)).thenReturn(savedUser);
        when(userMapper.toUserDto(savedUser)).thenReturn(expectedDto);

        UserDto result = userService.register(signUpDto);

        assertNotNull(result);
        assertEquals("newuser", result.getLogin());
        verify(userRepository).findByLogin("newuser");
        verify(userMapper).signUpToUser(signUpDto);
        verify(passwordEncoder).encode(CharBuffer.wrap(signUpDto.getPassword()));
        verify(userRepository).save(mappedUser);
        verify(userMapper).toUserDto(savedUser);
    }

    @Test
    void testRegister_UserAlreadyExists() {
        SignUpDto signUpDto = SignUpDto.builder()
                .login("existinguser")
                .firstName("Mark")
                .lastName("Smith")
                .password("password123".toCharArray())
                .build();

        User existingUser = User.builder()
                .login("existinguser")
                .build();

        when(userRepository.findByLogin("existinguser")).thenReturn(Optional.of(existingUser));

        AppException ex = assertThrows(AppException.class, () -> userService.register(signUpDto));
        assertEquals("Error: User already exists (HTTP 400)", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }
}
