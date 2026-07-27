import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  errorMessage: string = '';
  isLoading: boolean = false;

  ngOnInit() {
    const savedEmail = localStorage.getItem('saved_email');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('saved_email', email);
    } else {
      localStorage.removeItem('saved_email');
    }

    this.authService.login(email, password).subscribe({
      next: (res) => {
        // Redirigir si el rol es Superusuario, Administrador o Vigilante
        if (res.user.rol === 'SUPERUSUARIO' || res.user.rol === 'ADMINISTRADOR' || res.user.rol === 'VIGILANTE') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Acceso denegado. Este portal es exclusivo para Staff (Administradores y Vigilantes).';
          this.authService.logout();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
