/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RatioDownComponent } from './ratio-down.component';

describe('RatioDownComponent', () => {
  let component: RatioDownComponent;
  let fixture: ComponentFixture<RatioDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatioDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatioDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
