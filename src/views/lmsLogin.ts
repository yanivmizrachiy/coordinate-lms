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
import { logActivity } from '../lms/repository';
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
            'החשבון מחובר. מעכשיו התוצאות, הניסיונות והתקדמות הלמידה שלך נשמרים בחשבון וניתנים להצגה בדוחות.',
        }),
      ),
    );

    const actions = elem('div', {
      class: 'lms-auth__actions',
    });

    const continueButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'חזרה לתרגול',
    });

    continueButton.addEventListener('click', () => {
      navigate('#/workbook/1');
    });

    const progressButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'ההתקדמות והדוחות שלי',
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
        text: 'סטודיו סקירת תשובות',
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
    text: 'הרשמה לשמירת הלמידה ולקבלת דוחות',
  });

  const explanation = elem('p', {
    text:
      'כל דפי התרגול פתוחים גם ללא הרשמה. הרשמה נדרשת רק אם רוצים שהמערכת תשמור את התוצאות, הניסיונות וההתקדמות ותאפשר לקבל דוחות על הלמידה.',
  });

  const registrationAvailable =
    firebaseConfigured || localLmsFallbackEnabled;

  const modeNote = elem('div', {
    class: firebaseConfigured
      ? 'lms-mode lms-mode--online'
      : 'lms-mode lms-mode--local',
    text: firebaseConfigured
      ? 'הרשמה מאובטחת באמצעות Firebase Authentication. הסיסמה אינה נשמרת בפרופיל התלמיד או ב־Firestore.'
      : localLmsFallbackEnabled
        ? 'מצב פיתוח מקומי בלבד — אינו מיועד לפרסום. בייצור ההרשמה מתבצעת רק באמצעות Firebase Authentication.'
        : 'ההרשמה זמנית אינה זמינה: חסרות ' +
          String(missingFirebaseSettings.length) +
          ' הגדרות Firebase. התרגול עצמו נשאר פתוח ללא הרשמה וללא מעקב מרכזי.',
  });

  const form = elem('form', {
    class: 'lms-auth__form',
  }) as HTMLFormElement;

  const fullName = elem('input', {
    type: 'text',
    autocomplete: 'name',
    placeholder: 'שם מלא',
    maxlength: '120',
    required: 'true',
  }) as HTMLInputElement;

  const username = elem('input', {
    type: 'text',
    autocomplete: 'username',
    placeholder: 'שם משתמש',
    minlength: '3',
    maxlength: '32',
    required: 'true',
  }) as HTMLInputElement;

  const email = elem('input', {
    type: 'email',
    autocomplete: 'email',
    placeholder: 'כתובת אימייל',
    maxlength: '254',
    required: 'true',
  }) as HTMLInputElement;

  const password = elem('input', {
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'סיסמה — לפחות 10 תווים, כולל אות ומספר',
    minlength: '10',
    required: 'true',
  }) as HTMLInputElement;

  const school = elem('input', {
    type: 'text',
    autocomplete: 'organization',
    placeholder: 'בית ספר',
    maxlength: '120',
    required: 'true',
  }) as HTMLInputElement;

  const city = elem('input', {
    type: 'text',
    autocomplete: 'address-level2',
    placeholder: 'עיר',
    maxlength: '120',
    required: 'true',
  }) as HTMLInputElement;

  const className = elem('input', {
    type: 'text',
    placeholder: 'כיתה',
    maxlength: '120',
    required: 'true',
  }) as HTMLInputElement;

  const status = elem('div', {
    class: 'lms-auth__status',
    role: 'status',
    'aria-live': 'polite',
  });

  let registrationMode = true;

  const submitButton = elem('button', {
    class: 'btn btn--gold',
    type: 'submit',
    text: 'הרשמה והפעלת שמירה ודוחות',
  }) as HTMLButtonElement;

  const switchButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'כבר נרשמתי — התחברות',
  }) as HTMLButtonElement;

  const registrationOnlyFields = [
    fullName,
    username,
    school,
    city,
    className,
  ];

  switchButton.addEventListener('click', () => {
    registrationMode = !registrationMode;

    for (const field of registrationOnlyFields) {
      field.hidden = !registrationMode;
      field.required = registrationMode;
      field.disabled = !registrationMode;
    }

    password.autocomplete = registrationMode
      ? 'new-password'
      : 'current-password';

    submitButton.textContent = registrationMode
      ? 'הרשמה והפעלת שמירה ודוחות'
      : 'התחברות';

    switchButton.textContent = registrationMode
      ? 'כבר נרשמתי — התחברות'
      : 'משתמש חדש — הרשמה';

    status.textContent = '';
  });

  if (!registrationAvailable) {
    submitButton.disabled = true;
    status.textContent =
      'אפשר להמשיך לתרגל את כל הדפים ללא הרשמה. שמירה ודוחות יופעלו לאחר חיבור Firebase.';
    status.dataset.kind = 'error';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!registrationAvailable) return;

    submitButton.setAttribute('disabled', 'true');
    status.textContent = registrationMode
      ? 'יוצר חשבון מאובטח…'
      : 'מתחבר לחשבון…';
    status.dataset.kind = 'normal';

    const action = registrationMode
      ? registerStudent({
          fullName: fullName.value,
          username: username.value,
          email: email.value,
          password: password.value,
          school: school.value,
          city: city.value,
          className: className.value,
        })
      : loginStudent(email.value, password.value);

    void action
      .then(async (session) => {
        const activityOutcome = await logActivity({
          uid: session.uid,
          pageNumber: 1,
          type: registrationMode
            ? 'registration'
            : 'login',
          createdAt: Date.now(),
        });

        status.textContent = activityOutcome.central === 'failed'
          ? 'החשבון פעיל, אבל רישום אירוע ההתחברות עדיין לא הסתנכרן. אפשר להמשיך לתרגל והמערכת תנסה לסנכרן שוב.'
          : 'החשבון פעיל. מעכשיו הלמידה שלך נשמרת ומתועדת לצורך דוחות.';
        status.dataset.kind = activityOutcome.central === 'failed'
          ? 'error'
          : 'success';

        window.setTimeout(() => {
          navigate('#/workbook/1');
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
    school,
    city,
    className,
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
