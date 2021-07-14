import * as prettySize from 'prettysize';
import { AnalyticsTrack } from '../models/enums';
import { UserSettings } from '../models/interfaces';
import localStorageService from '../services/localStorage.service';

export const PATH_NAMES = {
  '/new': 'drive-web-register',
  '/login': 'drive-web-login',
  '/storage': 'drive-web-storage',
  '/settings': 'drive-web-settings',
  '/invite': 'drive-web-invite',
  '/remove': 'drive-web-remove'
};

const payload = {
  usage: 0,
  limit: 0,
  plan: 0
};

export function page(pageName: string): void {
  window.analytics.page(pageName);
}

function getUser(): UserSettings {
  return localStorageService.getUser();
}

function identifyPlanName(bytes: number): string {
  return bytes === 0 ? 'Free 2GB' : prettySize(bytes);
}

export function identifyUsage(newValue) {
  if (newValue !== payload.usage) {
    payload.usage = newValue;
    window.analytics.identify(getUser().uuid, { userId: getUser().uuid, storage: newValue, platform: 'web' });
  }
}

export function identifyPlan(newValue: number) {
  if (newValue !== payload.plan) {
    payload.plan = newValue;
    window.analytics.identify(getUser().uuid, { userId: getUser().uuid, plan: identifyPlanName(newValue), platform: 'web' });
  }
}

export function signOut() {
  window.analytics.track(AnalyticsTrack.SignOut, {
    email: getUser().email
  });
}

export function signIn(payload: { email: string, userId: string}): void {
  window.analytics.track(AnalyticsTrack.SignIn, payload);
}

export function signUp(payload: { properties: { userId: string, email: string}}): void {
  window.analytics.track(AnalyticsTrack.SignUp, payload);
}

export function userEnterPayments(): void {
  window.analytics.track(AnalyticsTrack.UserEnterPayments);
}

export function planSubscriptionSelected(payload: { price: string, plan_type: string, payment_type: string, plan_length: number, email: string }) {
  window.analytics.track(AnalyticsTrack.PlanSubscriptionSelected, payload);
}

const analyticsService = {
  page,
  identifyUsage,
  identifyPlan,
  signOut,
  signIn,
  signUp,
  userEnterPayments,
  planSubscriptionSelected
};

export default analyticsService;