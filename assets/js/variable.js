// public api
const BASE_URL = 'https://camerashopapi-production.up.railway.app'
const CLIENT_ID = 'P3PZZEFFkmv6otBZKPkEE1KkhnDWCJ19tu9kKN3h'
const CLIENT_SECRECT = 'fgHrTrLZIP4InOtBXrNySgbEERZjZSCHnc3ZVg6H6DhH7X0UgkhT8rbaxGXa3WrXfnngEDHJO8Nasd6AIg6SZU8oplp5dKYMWyjmxyGfzqaEs9pTHHWSSPEHo8Mdm9du'

// Local api
// const BASE_URL = 'http://127.0.0.1:8000'
// const CLIENT_ID = 'qEhPAuM2f8unhGqG5YSCMI7pac1H5cTuuTBOptdZ'
// const CLIENT_SECRECT = 'ts90kgfeFbvPxl7UMMmUSISUFingm0orktr1fUmPVHohhx3xFUOKOH1YLHcNS1j467waVvRD2cXu9jX5xQ8dUakyWotI2fUvAuhH64sl8AZ62ckYp9xlnVVKIeXd0u6t'

//Login - Register
const modalElement = document.querySelector('.js-modal')
const modalOverlayElement = document.querySelector('.js-modal__overlay')

const login = document.querySelector('.js-login-btn')
const loginFormBtn = document.querySelector('.auth-form__login-btn')

const register = document.querySelector('.js-register-btn')
const registerFormBtn = document.querySelector('.auth-form__register-btn')

const switch2RegisBtn = document.querySelector('.js-switch2Regis-btn')
const switch2LoginBtn = document.querySelector('.js-switch2Login-btn')

const logStatus = document.querySelector('.js-log-status')
const loginContainer = document.querySelector('.header__navbar-login-container')
const userInfoContainer = document.querySelector('.header__navbar-user')

const logoutBtn = document.querySelector('.js-logout-btn')

//Category
const cateList = document.querySelector('.js-cate-list')

// Quick view
const quickViewModal = document.querySelector('.js-quick-view')
const quickViewContent = document.querySelector('.js-quick-view-content')

// Header search input
var searchHistort = document.querySelector('.js-search-history')

// List product ( container chứa products )
var productsList = document.querySelector('.js-product-list')

// Manage Product
var manageProductBtn = document.querySelector('.manage-product-btn')
var manageProduct = document.querySelector('.manage-product')