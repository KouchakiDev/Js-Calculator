
    // --- عناصر DOM ---
    const exprInput = document.getElementById('exprInput');
    const resultEl = document.getElementById('result');
    const historyEl = document.getElementById('history');
    const clearBtn = document.getElementById('clearBtn');
    const backBtn = document.getElementById('backBtn');
    const eqBtn = document.getElementById('eqBtn');

    // --- هستهٔ امن محاسبه ---
    function safeCalc(expr) {
      // 1) نرمال‌سازی: تبدیل نمادهای بصری به عملگرهای واقعی JS و حذف فاصله‌های اضافی
      const normalized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/،/g, ',') // اگر کاربر ویرگول فارسی بزند
        .trim();

      // 2) نگهبان امنیتی: فقط این کاراکترها مجازند
      // اعداد \d، جمع +، منفی -، ضرب *، تقسیم /، پرانتزها ()، نقطه اعشار .، درصد % و فاصله \s
      const whitelist = /^[\d+\-*/().%\s]+$/;
      if (!whitelist.test(normalized)) return 'Invalid input';

      // 3) جلوگیری از اعداد جداشده با ویرگول (مثل 1,234) چون برای ما معنی خاصی ندارد
      if (/\d,\d/.test(normalized)) return 'Invalid input';

      // 4) محاسبه در محدودهٔ امن تابعِ جدید (بدون دسترسی به متغیرهای محلی)
      try {
        const value = new Function('"use strict"; return (' + normalized + ')')();
        return Number.isFinite(value) ? value : 'Math error';
      } catch (e) {
        return 'Error in calculation';
      }
    }

    // افزودن به ورودی (با نگاشت ^ ⇒ **)
    function appendToken(token) {
      if (token === '^') token = '**';
      // جایگزینی ویرگول به نقطه اگر لازم شد
      if (token === ',') token = '.';
      exprInput.value += token;
      exprInput.focus();
    }

    function backspace() {
      exprInput.value = exprInput.value.slice(0, -1);
      exprInput.focus();
    }

    function clearAll() {
      exprInput.value = '';
      resultEl.textContent = '';
      exprInput.focus();
    }

    function evaluateExpr() {
      const expr = exprInput.value;
      if (!expr.trim()) return;
      const res = safeCalc(expr);
      resultEl.textContent = res;
      if (typeof res === 'number') addHistory(expr, res);
    }

    function addHistory(expr, res) {
      const li = document.createElement('li');
      li.textContent = `${res} = ${expr}`;
      li.title = 'برای استفاده دوباره کلیک کنید';
      li.addEventListener('click', () => {
        exprInput.value = expr;
        exprInput.focus();
      });
      historyEl.prepend(li);
    }

    // اتصال دکمه‌ها
    document.querySelectorAll('button[data-key]').forEach(btn => {
      btn.addEventListener('click', () => appendToken(btn.dataset.key));
    });
    eqBtn.addEventListener('click', evaluateExpr);
    clearBtn.addEventListener('click', clearAll);
    backBtn.addEventListener('click', backspace);

    // پشتیبانی از کیبورد
    document.addEventListener('keydown', (e) => {
      const k = e.key;
      if (/^[0-9+\-*/().%]$/.test(k)) {
        appendToken(k);
        e.preventDefault();
      } else if (k === 'Enter') {
        evaluateExpr();
        e.preventDefault();
      } else if (k === 'Backspace') {
        backspace();
      } else if ((e.ctrlKey || e.metaKey) && (k === 'l' || k === 'L')) {
        clearAll();
        e.preventDefault();
      } else if (k === '^') {
        appendToken('^'); // تبدیل به ** در appendToken
        e.preventDefault();
      }
    });

    // فوکوس اولیه روی ورودی
    exprInput.focus();