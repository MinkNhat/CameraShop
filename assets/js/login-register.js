// Mở form login
login.addEventListener('click', clickLogin)

// Mở form register
register.addEventListener('click', clickRegister)

// Đóng modal
modalOverlayElement.addEventListener('click', function() {
    modalElement.style.display = "none"
})

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    loginContainer.classList.remove('js-log-status')
    userInfoContainer.classList.add('js-log-status')
})


// Xử lý khi click vào nút Login
function clickLogin() {
    modalElement.style.display = "block"
    document.querySelector('.js-register-form').style.display = "none"
    document.querySelector('.js-login-form').style.display = "block"
    
    switch2RegisBtn.addEventListener('click', clickRegister)
    loginFormBtn.addEventListener('click', loginForm)
}

// Xử lý login form
async function loginForm() {
    const username = document.querySelector('.auth-form__login-username')
    const password = document.querySelector('.auth-form__login-password')

    // Validate
    if(username.value == "") {
        alert("Bạn chưa nhập Tên tài khoản!")
        username.focus()
        return  
    }
    if(password.value == "") {
        alert("Bạn chưa nhập Mật khẩu!")
        password.focus()
        return  
    }

    const loader = document.querySelector('.js-login-loading')

    try {
        loginFormBtn.style.display = "none"
        loader.style.display = "block"

        let res = await fetch("http://127.0.0.1:8000/o/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "password",
                username: username.value,
                password: password.value,
                client_id: "qEhPAuM2f8unhGqG5YSCMI7pac1H5cTuuTBOptdZ",  
                client_secret: "ts90kgfeFbvPxl7UMMmUSISUFingm0orktr1fUmPVHohhx3xFUOKOH1YLHcNS1j467waVvRD2cXu9jX5xQ8dUakyWotI2fUvAuhH64sl8AZ62ckYp9xlnVVKIeXd0u6t" 
            })
        });

        let data = await res.json()

        if (res.ok) {
            localStorage.setItem("access_token", data.access_token)
            localStorage.setItem("refresh_token", data.refresh_token)
            
            window.location.reload()
        } else {
            alert(data.error_description)
        }
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        alert("Có lỗi xảy ra khi đăng nhập!");
    } finally {
        loginFormBtn.style.display = "inline-block"
        loader.style.display = "none"
    }
}

// Xử lý khi click vào nút Register
function clickRegister() {
    modalElement.style.display = "block"
    document.querySelector('.js-login-form').style.display = "none"
    document.querySelector('.js-register-form').style.display = "block"
    document.querySelector('.modal__body').style.margin = "10vh auto 0"
    
    switch2LoginBtn.addEventListener('click', clickLogin)
    registerFormBtn.addEventListener('click', registerForm)
}

// Xử lý register form
async function registerForm() {
    const lastName = document.querySelector('.auth-form__input-name')
    const email = document.querySelector('.auth-form__input-email')
    const username = document.querySelector('.auth-form__input-username')
    const password = document.querySelector('.auth-form__input-password')
    const confirm = document.querySelector('.auth-form__input-confirm')
    const avatarInput = document.getElementById("avatar-input")

    // Validate
    if (!lastName.value || !email.value || !username.value || !password.value || !confirm.value) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return
    }
    if (password.value !== confirm.value) {
        alert("Mật khẩu xác nhận không khớp!");
        return
    }

    const loader = document.querySelector('.js-register-loading')

    try {
        registerFormBtn.style.display = "none"
        loader.style.display = "block"

        let formData = new FormData()
        formData.append("last_name", lastName.value)
        formData.append("username", username.value)
        formData.append("password", password.value)
        formData.append("email", email.value)
        
        // Nếu có ảnh
        if (avatarInput.files.length > 0) {
            formData.append("avatar", avatarInput.files[0])
        }


        let res = await fetch("http://127.0.0.1:8000/users/", {
            method: "POST",
            body: formData
        })

        if (res.ok) {
            lastName.value = username.value = email.value = password.value = confirm.value = ""
            avatarInput.value = ""
            document.getElementById("avatar-preview").src = "./assets/img/avatar-default.jpg"
            clickLogin()
        } else {
            alert("Lỗi khi đăng ký")
        }
        
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error)
        alert("Có lỗi xảy ra khi đăng nhập!")
    } finally {
        registerFormBtn.style.display = "inline-block"
        loader.style.display = "none"
    }

}

document.getElementById("avatar-preview").addEventListener("click", function() {
    document.getElementById("avatar-input").click();
});

document.getElementById("avatar-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("avatar-preview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});