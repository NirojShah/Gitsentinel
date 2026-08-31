import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatWindow } from './chat-window';

describe('ChatWindow', () => {
  let component: ChatWindow;
  let fixture: ComponentFixture<ChatWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
