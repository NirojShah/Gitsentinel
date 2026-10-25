import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import RepoConfigService from './repo-config service/repo-config.service';
import { RepoConfigModalComponent } from './repo-config';

describe('RepoConfig', () => {
  let component: RepoConfigModalComponent;
  let fixture: ComponentFixture<RepoConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepoConfigModalComponent],
      providers: [
        {
          provide: RepoConfigService,
          useValue: { createRepoConfig: () => of({ data: {} }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoConfigModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
