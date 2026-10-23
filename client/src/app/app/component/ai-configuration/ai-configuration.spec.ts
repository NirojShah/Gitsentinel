import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AiConfiguration } from './ai-configuration';
import { AiConfigurationService } from './ai-configuration.service';

describe('AiConfiguration', () => {
  let component: AiConfiguration;
  let fixture: ComponentFixture<AiConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiConfiguration],
      providers: [
        provideRouter([]),
        {
          provide: AiConfigurationService,
          useValue: {
            getConfigurations: () => of({ statusCode: 200, data: [] }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiConfiguration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
