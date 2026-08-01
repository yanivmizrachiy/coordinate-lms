import { elem } from '../lib/dom';
import { navigate } from '../router';
import {
  currentSession,
  loginStudent,
  logoutStudent,
  registerStudent,
} from '../lms/auth';
import {
  firebaseConfigured,
  localLmsFallbackEnabled,
  missingFirebaseSettings,
} from '../lms/firebase';
import {
  claimGuestProgress,
  logActivity,
} from '../lms/repository';
import type { ViewContext } from './context';

export function lmsLogin({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('הרשמה והתחברות');

  const existingSession = currentSession();
  const shell = elem('div', {
    class: 'container lms-auth',
  });

  if (existingSession) {
    shell.append(
      elem(
        'section',
        { class: 'lms-auth__card' },
        elem('h1', {
          text: 'שלום ' + existingSession.fullName,
        }),
        elem('p', {
          text:
            'החשבון מחובר. כל תוצאה חדשה תישמר תחת המשתמש הזה.',
        }),
      ),
    );

    const actions = elem('div', {
      class: 'lms-auth__actions',
    });

    const continueButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'המשך לעמוד 2',
    });

    continueButton.addEventListener('click', () => {
      navigate('#/workbook/2');
    });

    const progressButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'ההתקדמות שלי',
    });

    progressButton.addEventListener('click', () => {
      navigate('#/progress');
    });

    const adminButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'דשבורד מורה',
    });

    adminButton.addEventListener('click', () => {
      navigate('#/admin');
    });

    const logoutButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'התנתקות',
    });

    logoutButton.addEventListener('click', () => {
      void logoutStudent().then(() => {
        location.reload();
      });
    });

    actions.append(continueButton, progressButton);

    if (existingSession.role === 'admin') {
      actions.append(adminButton);
      const keysButton = elem('button', {
        class: 'btn btn--teacher',
        type: 'button',
        text: 'סטודיו מפתחות תשובה',
      });
      keysButton.addEventListener('click', () => {
        navigate('#/keys');
      });
      actions.append(keysButton);
    }

    actions.append(logoutButton);
    shell.append(actions);
    outlet.append(shell);
    return;
  }

  const title = elem('h1', {
    text: 'הרשמה להמשך התרגול',
  });

  const explanation = elem('p', {
    text:
      'עמוד 1 פתוח ללא הרשמה. לאחר ההרשמה הציון שכבר התקבל נשמר בחשבון.',
  });

  const registrationAvailable =
    firebaseConfigured || localLmsFallbackEnabled;

  const modeNote = elem('div', {
    class: firebaseConfigured
      ? 'lms-mode lms-mode--online'
      : 'lms-mode lms-mode--local',
    text: firebaseConfigured
      ? 'שמירה מרכזית מחוברת ל־Firebase.'
      : localLmsFallbackEnabled
        ? 'מצב פיתוח מקומי בלבד — הנתונים אינם משותפים בין מכשירים.'
        : 'ההרשמה נעולה: חסרות ' +
          String(missingFirebaseSettings.length) +
          ' הגדרות Firebase. כך נמנעת יצירת הרשמה מקומית שלא תופיע בדשבורד המורה.',
  });

  const form = elem('form', {
    class: 'lms-auth__form',
  }) as HTMLFormElement;

  const fullName = elem('input', {
    type: 'text',
    autocomplete: 'name',
    placeholder: 'שם מלא',
    required: 'true',
  }) as HTMLInputElement;

  const username = elem('input', {
    type: 'text',
    autocomplete: 'username',
    placeholder: 'שם משתמש',
    required: 'true',
  }) as HTMLInputElement;

  const email = elem('input', {
    type: 'email',
    autocomplete: 'email',
    placeholder: 'כתובת אימייל',
    required: 'true',
  }) as HTMLInputElement;

  const password = elem('input', {
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'סיסמה — לפחות 6 תווים',
    required: 'true',
  }) as HTMLInputElement;

  const className = elem('input', {
    type: 'text',
    placeholder: 'כיתה',
  }) as HTMLInputElement;

  const school = elem('input', {
    type: 'text',
    placeholder: 'בית ספר',
  }) as HTMLInputElement;

  const status = elem('div', {
    class: 'lms-auth__status',
    role: 'status',
  });

  let registrationMode = true;

  const submitButton = elem('button', {
    class: 'btn btn--gold',
    type: 'submit',
    text: 'הרשמה ושמירת הציון',
  }) as HTMLButtonElement;

  const switchButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'כבר נרשמתי — התחברות',
  }) as HTMLButtonElement;

  switchButton.addEventListener('click', () => {
    registrationMode = !registrationMode;

    fullName.hidden = !registrationMode;
    username.hidden = !registrationMode;
    className.hidden = !registrationMode;
    school.hidden = !registrationMode;

    password.autocomplete = registrationMode
      ? 'new-password'
      : 'current-password';

    submitButton.textContent = registrationMode
      ? 'הרשמה ושמירת הציון'
      : 'התחברות';

    switchButton.textContent = registrationMode
      ? 'כבר נרשמתי — התחברות'
      : 'משתמש חדש — הרשמה';

    status.textContent = '';
  });

  if (!registrationAvailable) {
    submitButton.disabled = true;
    switchButton.disabled = true;
    status.textContent =
      'לא ניתן להירשם עד השלמת החיבור המרכזי. עמוד 1 עדיין זמין כאורח.';
    status.dataset.kind = 'error';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!registrationAvailable) return;

    submitButton.setAttribute('disabled', 'true');
    status.textContent = 'מתבצעת שמירה…';
    status.dataset.kind = 'normal';

    const action = registrationMode
      ? registerStudent({
          fullName: fullName.value,
          username: username.value,
          email: email.value,
          password: password.value,
          className: className.value,
          school: school.value,
        })
      : loginStudent(email.value, password.value);

    void action
      .then(async (session) => {
        const guestClaim = await claimGuestProgress(session.uid);

        if (!guestClaim.complete) {
          status.textContent =
            'החשבון נוצר, אבל העברת התקדמות האורח למערכת המרכזית נכשלה. ההתקדמות נשארה במכשיר; בדקו חיבור ונסו להתחבר שוב.';
          status.dataset.kind = 'error';
          return;
        }

        const activityOutcome = await logActivity({
          uid: session.uid,
          pageNumber: 1,
          type: registrationMode
            ? 'registration'
            : 'login',
          createdAt: Date.now(),
        });

        status.textContent = activityOutcome.central === 'failed'
          ? 'החשבון וההתקדמות נשמרו, אך רישום פעילות ההתחברות לא הסתנכרן. עוברים לתרגול…'
          : 'החשבון וההתקדמות נשמרו. עוברים להמשך התרגול…';
        status.dataset.kind = activityOutcome.central === 'failed'
          ? 'error'
          : 'success';

        window.setTimeout(() => {
          navigate('#/workbook/2');
        }, 400);
      })
      .catch((error: unknown) => {
        status.textContent =
          error instanceof Error
            ? error.message
            : 'הפעולה נכשלה.';
        status.dataset.kind = 'error';
      })
      .finally(() => {
        submitButton.disabled = !registrationAvailable;
      });
  });

  form.append(
    fullName,
    username,
    email,
    password,
    className,
    school,
    status,
    submitButton,
    switchButton,
  );

  const card = elem(
    'section',
    { class: 'lms-auth__card' },
    title,
    explanation,
    modeNote,
    form,
  );

  shell.append(card);
  outlet.append(shell);
}
