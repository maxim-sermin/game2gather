import {Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../../services/security/authentication.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginInProgress = false;

  constructor(private router: Router, private renderer: Renderer2, private authenticationService: AuthenticationService) { }

  @ViewChild('errorBox', {static: false, read: ElementRef}) errorBox?: ElementRef = undefined;

  ngOnInit(): void {
  }

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required),
  });

  submit() {
    if (this.form.valid) {
      this.loginInProgress = true;
      this.authenticationService.performLogin(this.form.value.name, this.form.value.password).subscribe(next => {
        this.loginInProgress = false;
        this.router.navigate(['/match']);
      }, error => {
        this.loginInProgress = false;
        if (error.status === 403) {
          this.error = "Username or password incorrect";
        } else if (error.status === 0) {
          this.error = "Could not reach server";
        } else {
          console.log("Error while logging in:");
          console.log(error);
          this.error = "Something went wrong";
        }
        this.renderer.setStyle(this.errorBox?.nativeElement, 'visibility', 'visible');
      })
    } else {
      this.error = "Please enter username and password";
      this.renderer.setStyle(this.errorBox?.nativeElement, 'visibility', 'visible');
    }
  }
  @Input() error?: string | null;
}
