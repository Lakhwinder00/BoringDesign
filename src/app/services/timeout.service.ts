import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from './auth.service';

@Injectable()
export class TimeoutService {
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date | undefined;
  title = 'angular-idle-timeout';
  constructor(
    private idle: Idle,
    private keepalive: Keepalive,
    private router: Router,
    private authService:AuthService
  ) {
    
  }
  start() {
    // sets an idle timeout of 5 minutes
    this.idle.setIdle(15);
    // sets the keepalive interval to 15 seconds
    this.keepalive.interval(15);
    // starts watching for user activity and resets the idle timer on activity
    this.idle.watch();
    // sets the idle timeout warning message
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      console.log(`You will be logged out in ${countdown} seconds.`);
    });
    // logs out the user and navigates to the login page when the idle timeout is reached
    this.idle.onTimeout.subscribe(() => {
      this.authService.getUserLoggedIn().subscribe(userLoggedIn => {
        if (userLoggedIn) {
          this.idle.watch()
          this.timedOut = false;
        } else {
          this.idle.stop();
          this.router.navigate(['/login']);
        }
      })
    });
    // sets the interrupt sources to listen for user activity
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
  }

  logout() {
    this.router.navigate(['/logout']);
  }
}
