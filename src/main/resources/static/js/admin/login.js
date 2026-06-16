const auth = (() => {
    let _timer = null;

    /* ── 내부 유틸리티: 타이머 ── */
    function startTimer(totalSec) {
        if (_timer) clearInterval(_timer);
        const el = document.getElementById('verifyTimer');

        function tick() {
            if (!el) return;
            if (totalSec <= 0) {
                clearInterval(_timer);
                el.textContent = '시간 초과';
                return;
            }
            const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
            const s = String(totalSec % 60).padStart(2, '0');
            el.textContent = `남은 시간 ${m}:${s}`;
            totalSec--;
        }

        tick();
        _timer = setInterval(tick, 1000);
    }

    /* ── 뷰 전환 ── */
    function switchToVerify() {
        document.getElementById('viewLogin').classList.remove('active');
        document.getElementById('viewVerify').classList.add('active');
        document.getElementById('pageTitle').textContent = '관리자 이메일 인증';
    }

    function switchToLogin() {
        document.getElementById('viewVerify').classList.remove('active');
        document.getElementById('viewLogin').classList.add('active');
        document.getElementById('pageTitle').textContent = '관리자 로그인';
        if (_timer) clearInterval(_timer);
    }

    /* ── 비즈니스 로직: 로그인 (Step 1) ── */
    function handleLogin() {
        const id = document.getElementById('username').value.trim();
        const pw = document.getElementById('password').value.trim();

        if (!id || !pw) {
            showAlertModal("아이디와 비밀번호를 입력해주세요."); // main.js 공통함수
            return;
        }

        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        axios.post('/admin/login/step1', {username: id, password: pw}, {
            headers: {[csrfHeader]: csrfToken}
        })
            .then(res => {
                if (res.data.success) {
                    switchToVerify();
                    document.getElementById('verifyEmail').value = res.data.email;
                    sessionStorage.setItem("loginId", id);
                    startTimer(300); // 1단계 성공 시 타이머 시작
                } else {
                    showAlertModal(res.data.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
                }
            })
            .catch(() => showAlertModal("로그인 중 오류가 발생했습니다."));
    }

    /* ── 비즈니스 로직: 인증번호 발송 ── */
    function sendCode() {
        const email = document.getElementById('verifyEmail').value.trim();
        if (!email) {
            showAlertModal('이메일을 입력해주세요.');
            return;
        }

        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        axios.post('/admin/email/verify', {email}, {
            headers: {[csrfHeader]: csrfToken}
        })
            .then(res => {
                if (res.data.success) startTimer(300);
                else showAlertModal('등록된 이메일이 아닙니다.');
            })
            .catch(() => showAlertModal('발송 실패. 다시 시도해주세요.'));
    }

    /* ── 비즈니스 로직: 인증 완료 (Step 2) ── */
    function confirmCode() {
        const code = document.getElementById('verifyCode').value.trim();
        if (!code) {
            showAlertModal('인증번호를 입력해주세요.');
            return;
        }

        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        axios.post('/admin/login/step2', {code: code}, {
            headers: {[csrfHeader]: csrfToken}
        })
            .then(res => {
                if (res.data.success) {
                    if (_timer) clearInterval(_timer);
                    // 최종 로그인은 컨트롤러의 step2 성공 로직에 따라 form 제출
                    document.getElementById('loginForm').submit();
                } else {
                    showAlertModal(res.data.message || '인증번호가 올바르지 않습니다.');
                }
            })
            .catch(() => showAlertModal('인증 실패. 다시 시도해주세요.'));
    }

    /* ── 초기화 및 이벤트 바인딩 ── */
    function init() {
        // 아이디 복원
        const savedId = sessionStorage.getItem("loginId");
        const idInput = document.getElementById('username');
        const pwInput = document.getElementById('password');
        const btnLogin = document.getElementById('btnLogin');
        const verifyCodeInput = document.getElementById('verifyCode');

        // 로그인 버튼 클릭 이벤트
        btnLogin?.addEventListener('click', handleLogin);

        // 아이디나 비밀번호 입력창에서 엔터 누르면 로그인 실행
        const enterHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // 폼의 기본 제출 동작 방지
                handleLogin();      // 로그인 함수 실행
            }
        };

        idInput?.addEventListener('keypress', enterHandler);
        pwInput?.addEventListener('keypress', enterHandler);

        verifyCodeInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmCode(); // 인증 번호 확인 함수 실행
            }
        });

        if (savedId && idInput) idInput.value = savedId;

        // 이벤트 연결
        document.getElementById('btnLogin')?.addEventListener('click', handleLogin);
        document.querySelector('.input-inner-btn')?.addEventListener('click', sendCode);
        document.querySelector('#viewVerify .btn-submit')?.addEventListener('click', confirmCode);
        document.querySelector('.footer-link')?.addEventListener('click', switchToLogin);

        // 5회 실패 체크 (전역 window 객체 사용)
        if (window._failCount >= 5) {
            openOverlay('modalLocked'); // main.js 공통함수
        }
    }

    return {init, switchToLogin};
})();

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', auth.init);