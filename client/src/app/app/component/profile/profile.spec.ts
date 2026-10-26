import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Profile } from './profile';
import { ProfileService } from './profile-service/profile-service';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        {
          provide: ProfileService,
          useValue: {
            fetchProfileInfo: () =>
              Promise.resolve({
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                isActive: true,
                isVerified: true,
              }),
            fetchprofileIcon: () => {},
            profileIcon: { initials: 'TU' },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
