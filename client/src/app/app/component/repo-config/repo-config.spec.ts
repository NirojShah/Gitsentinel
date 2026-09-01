import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepoConfig } from './repo-config';

describe('RepoConfig', () => {
  let component: RepoConfig;
  let fixture: ComponentFixture<RepoConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepoConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
