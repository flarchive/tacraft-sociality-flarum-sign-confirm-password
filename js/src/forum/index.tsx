import app from 'flarum/forum/app';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import { extend, override } from 'flarum/common/extend';
import Stream from 'flarum/common/utils/Stream';
import extractText from 'flarum/common/utils/extractText';
import type ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';

const SLUG = 'tacraft-sociality-sign-confirm-password';

// Core loads the sign up modal lazily, so it must be referenced by module path
// (Flarum 2 defers `extend` until the module has been loaded).
const SIGN_UP_MODAL = 'flarum/forum/components/SignUpModal';
const CONFIRM_FIELD = 'tacraftConfirmPassword';

interface StrengthSettings {
  weakColor: string;
  mediumColor: string;
  strongColor: string;
  enableInputColor: boolean;
  enableInputBorderColor: boolean;
  enablePasswordToggle: boolean;
}

function attribute<T>(key: string, fallback: T): T {
  try {
    const forum = app.forum as any;
    const value = forum?.attribute?.(`${SLUG}.${key}`);

    return value === undefined || value === null || value === '' ? fallback : (value as T);
  } catch (e) {
    return fallback;
  }
}

function settings(): StrengthSettings {
  return {
    weakColor: attribute('weakColor', '#e5484d'),
    mediumColor: attribute('mediumColor', '#f5a524'),
    strongColor: attribute('strongColor', '#30a46c'),
    enableInputColor: attribute('enableInputColor', false),
    enableInputBorderColor: attribute('enableInputBorderColor', true),
    enablePasswordToggle: attribute('enablePasswordToggle', true),
  };
}

function trans(key: string, fallback: string): string {
  try {
    return extractText(app.translator.trans(`${SLUG}.forum.${key}`) as any);
  } catch (e) {
    return fallback;
  }
}

/**
 * Compact offline strength estimator (0 = empty/very weak, 4 = strong).
 * Mirrors the weak / medium / strong buckets of the password-strength plugin.
 */
function scorePassword(password: string): number {
  if (!password) {
    return 0;
  }

  const length = password.length;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;

  let score = 0;

  if (length >= 8) {
    score += 1;
  }
  if (length >= 12) {
    score += 1;
  }
  if (classes >= 2) {
    score += 1;
  }
  if (classes >= 3) {
    score += 1;
  }
  if (length >= 16 && classes >= 3) {
    score += 1;
  }

  if (/^(.)\1+$/.test(password)) {
    score = 0;
  }
  if (/^(?:password|passwd|qwerty|123456|abcdef|letmein|admin)/i.test(password)) {
    score = Math.min(score, 1);
  }
  if (/^[a-z]+$/i.test(password) && length < 10) {
    score = Math.min(score, 1);
  }
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
  }

  return Math.max(0, Math.min(4, score));
}

interface PasswordFieldAttrs extends ComponentAttrs {
  parent: any;
  confirm?: boolean;
}

class PasswordField extends Component<PasswordFieldAttrs> {
  revealed!: Stream<boolean>;
  score!: Stream<number>;

  oninit(vnode: Mithril.Vnode<PasswordFieldAttrs, this>) {
    super.oninit(vnode);

    this.revealed = Stream(false);
    this.score = Stream(0);
  }

  strengthColor(score: number): string {
    const s = settings();

    if (score >= 4) {
      return s.strongColor;
    }

    if (score >= 2) {
      return s.mediumColor;
    }

    return s.weakColor;
  }

  strengthLabel(score: number): string {
    if (score >= 4) {
      return trans('strength_strong', 'Strong');
    }

    if (score >= 2) {
      return trans('strength_medium', 'Could be stronger');
    }

    return trans('strength_weak', 'Weak');
  }

  view(): Mithril.Children {
    const { parent, confirm } = this.attrs;
    const s = settings();
    const revealed = this.revealed();
    const confirmValue = typeof parent.confirmPassword === 'function' ? parent.confirmPassword() : '';
    const passwordValue = typeof parent.password === 'function' ? parent.password() : '';
    const color = this.strengthColor(this.score());
    const hasValue = (confirm ? confirmValue : passwordValue).length > 0;
    const activePills = this.score() >= 4 ? 3 : this.score() >= 2 ? 2 : 1;

    const label = confirm
      ? trans('field_placeholder', 'Confirm Password')
      : extractText(app.translator.trans('core.forum.sign_up.password_placeholder') as any);

    return (
      <div className="Form-group SignConfirmPassword-field" style={{ position: 'relative' }}>
        <label className="label">{label}</label>
        <input
          className="FormControl"
          name={confirm ? 'confirmPassword' : 'password'}
          type={revealed ? 'text' : 'password'}
          autocomplete="new-password"
          placeholder={label}
          aria-label={label}
          value={confirm ? confirmValue : passwordValue}
          disabled={parent.loading}
          oninput={(e: InputEvent) => {
            const value = (e.target as HTMLInputElement).value;

            if (confirm) {
              if (typeof parent.confirmPassword === 'function') {
                parent.confirmPassword(value);
              }
              if (typeof parent.confirmError === 'function') {
                parent.confirmError(null);
              }
            } else {
              if (typeof parent.password === 'function') {
                parent.password(value);
              }
              this.score(scorePassword(value));
            }
          }}
          style={{
            paddingRight: s.enablePasswordToggle ? '44px' : undefined,
            borderColor: s.enableInputBorderColor && !confirm && hasValue ? color : undefined,
            color: s.enableInputColor && !revealed && !confirm && hasValue ? color : undefined,
          }}
        />
        {s.enablePasswordToggle ? (
          <button
            type="button"
            className="Button Button--icon SignConfirmPassword-reveal"
            aria-label={revealed ? trans('hide_password', 'Hide password') : trans('show_password', 'Show password')}
            onclick={(e: MouseEvent) => {
              e.preventDefault();
              this.revealed(!revealed);
            }}
            style={{
              position: 'absolute',
              top: '38px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              padding: '2px 4px',
              cursor: 'pointer',
              color: 'var(--muted-color)',
            }}
          >
            <i className={revealed ? 'fas fa-eye-slash' : 'fas fa-eye'} />
          </button>
        ) : null}
        {confirm && typeof parent.confirmError === 'function' && parent.confirmError() ? (
          <div className="Form-group-error" style={{ color: 'var(--control-danger-color, #d32f2f)', marginTop: '6px', fontSize: '0.85rem' }}>
            {parent.confirmError()}
          </div>
        ) : null}
        {!confirm && hasValue ? (
          <div className="StrengthIndicator active">
            <div className="StrengthIndicator-pills">
              {[0, 1, 2].map((index) => (
                <div key={index} className="StrengthPill" style={{ backgroundColor: index < activePills ? color : undefined }} />
              ))}
            </div>
            <div className="StrengthIndicator-label">
              <span style={{ color }}>{this.strengthLabel(this.score())}</span>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

app.initializers.add(SLUG, () => {
  extend(SIGN_UP_MODAL, 'oninit', function (this: any) {
    this.confirmPassword = Stream('');
    this.confirmError = Stream<string | null>(null);
  });

  extend(SIGN_UP_MODAL, 'fields', function (this: any, items: ItemList<Mithril.Children>) {
    // Third party registrations carry a token instead of a password.
    if (this.attrs.token) {
      return;
    }

    // Replace the core password field so the strength meter and the optional
    // reveal button can live inside it, then add the confirmation field below.
    items.setContent('password', <PasswordField parent={this} />);
    items.add(CONFIRM_FIELD, <PasswordField parent={this} confirm />, 5);
  });

  // Compare locally and block the submit: sending an extra attribute to the
  // API and validating it in a `Saving` listener made the request fail with an
  // opaque 500, so the check stays on the client side.
  override(SIGN_UP_MODAL, 'onsubmit', function (this: any, original: (e: SubmitEvent) => void, e: SubmitEvent) {
    const password = typeof this.password === 'function' ? this.password() : '';
    const confirmation = typeof this.confirmPassword === 'function' ? this.confirmPassword() : '';

    if (!this.attrs.token && password !== confirmation) {
      e.preventDefault();
      this.loading = false;

      if (typeof this.confirmError === 'function') {
        this.confirmError(trans('password_mismatch', 'Passwords do not match.'));
      }

      return;
    }

    return original(e);
  });
});
