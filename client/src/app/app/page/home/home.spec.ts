import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from '../../core/message-service/message.service';
import { ChatService } from '../../core/chat-service/chat.service';
import { McpService } from '../../core/mcp-service/mcp.service';
import { ProfileService } from '../../component/profile/profile-service/profile-service';
import RepoConfigService from '../../component/repo-config/repo-config service/repo-config.service';
import { HomeComponent } from './home';

describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: MessageService, useValue: { fetchMessages: () => of({ body: [] }), sendMessage: () => of({ body: {} }) } },
        { provide: ChatService, useValue: { fetchChats: () => of({ data: [] }), createChat: () => of({ data: {} }) } },
        { provide: RepoConfigService, useValue: { getConfiguredRepositories: () => of({ data: [] }), createRepoConfig: () => of({ data: {} }) } },
        { provide: McpService, useValue: { getStatus: () => of({ status: 'success', connected: false, message: '' }), getTools: () => of({ data: [] }), connect: () => of({ status: 'success', message: '' }), disconnect: () => of({ status: 'success', message: '' }) } },
        { provide: ProfileService, useValue: { fetchProfileInfo: () => Promise.resolve({ name: 'Test', username: 'test', email: 'test@example.com', isActive: true, isVerified: true }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
