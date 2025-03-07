app()

function app() {
    loadUser()
    loadCate()
    loadProducts()
    // renderProducts()

    // Prevent sự kiện out focus vào search header ( khi click vào item vẫn giữ focus )
    searchHistort.onmousedown = function(e) {
        e.preventDefault()
    }
}

async function loadUser() {
    try {
        const token = localStorage.getItem('access_token')
        if(token) {
            let res = await fetch(`${BASE_URL}/users/current-user/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                // body: JSON.stringify()
            });
    
            let data = await res.json()
            if(data.id) {
                if(data.avatar!=='')
                    document.querySelector('.header__navbar-user-img').src = data?.avatar

                document.querySelector('.header__navbar-user-name').innerText = `${data?.first_name} ${data?.last_name}`
        
                // chuyển status login
                loginContainer.classList.add('js-log-status')
                userInfoContainer.classList.remove('js-log-status')
            }
        }  
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        alert("Có lỗi xảy ra khi đăng nhập!");
    }
}

async function loadCate() {
    try {
        let res = await fetch(`${BASE_URL}/categories/`, {
            method: "GET",
        })

        let data = await res.json()
        
        let html = `
            <li class="category__item">
                <a href="" class="category__item-link">Tất cả sản phẩm</a>
            </li>
        `
        data.forEach(cate => {
            html += `
                <li class="category__item">
                    <a href="" class="category__item-link">${cate.name}</a>
            `

            cate.subcategories.forEach(subCate => {
                html += `
                    <ul class="sub-category__list">
                        <li class="sub-category__item">
                            <a href="" class="sub-category__item-link">${subCate.name}</a>
                        </li> 
                    </ul>
                `
            })
            html += `</li>`
        })
        cateList.innerHTML = html

    } catch (error) {
        console.error("Lỗi khi load category:", error);
    }
}

async function loadProducts() {
    try {
        let res = await fetch(`${BASE_URL}/products/`, {
            method: "GET",
        })

        let data = await res.json()
        console.log(data)

        var html = data.map(product => {
            return `
                <div class="grid__column-2-4 product-item-container">
                    <div class="home-product-item">
                        <div class="home-product-wapper">
                            <div class="home-product-item__img" style="background-image: url(${product.main_image})"></div>
                            <div class="home-product-item__quick-view  js-quick-view-btn">
                                <span class="home-product-item__quick-view-link">XEM NHANH</span>
                            </div>
                        </div>
                        <div class="home-product-item__name" title="${product.name}">${product.name}</div>
                        <div class="home-product-item__price">
                            <span class="home-product-item__price-old">${FormatDotNumber((product.price*1.1).toFixed())}<span>đ</span></span>
                            <span class="home-product-item__price-current">${FormatDotNumber(product.price)}<span>đ</span></span>
                        </div>
                        <div class="home-product-item__action">
                            <div class="home-product-item__like home-product-item__like-liked">
                                <i class="home-product-item__like-icon-empty fa-regular fa-heart"></i>
                                <i class="home-product-item__like-icon-fill fa-solid fa-heart"></i>
                            </div>

                            <div class="home-product-item__rating">
                                <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                                <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                                <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                                <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                                <i class="home-product-item__rating-icon fa-solid fa-star"></i>
                            </div>

                            <!-- <span class="home-product-item__sold">88 đã bán</span> -->
                        </div>
                        <!-- <div class="home-product-item__origin">
                            <span class="home-product-item__origin-brand">Sony</span>
                            <span class="home-product-item__origin-name">Nhật Bản</span>
                        </div> -->
                        <div class="home-product-item__sale-off">
                            <span class="home-product-item__sale-label">SALE</span>
                            <span class="home-product-item__sale-percent">10%</span>
                        </div>
                        <div class="home-product-item__oder">
                            <button class="home-product-item__oder-btn">ĐẶT HÀNG NGAY</button>
                        </div>
                    </div>
                </div>
            `
        })
        productsList.innerHTML = html.join("") 

    } catch (error) {
        console.error("Lỗi khi load products:", error);
    }
}

// Hàm render products từ api, sau đó nhận sự kiện click vào nút "xem nhanh" trên từng sản phẩm
function renderProducts() {
    fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(function(data){
        var html = data.map(function(product){
            return `
        <div class="grid__column-2-4 product-item-container">
            <div class="home-product-item">
                <div class="home-product-wapper">
                    <div class="home-product-item__img" style="background-image: url(${product.imgThump})"></div>
                    <div class="home-product-item__quick-view  js-quick-view-btn">
                        <span class="home-product-item__quick-view-link">XEM NHANH</span>
                    </div>
                </div>
                <div class="home-product-item__name">${product.name}</div>
                <div class="home-product-item__price">
                    <span class="home-product-item__price-old">${FormatDotNumber((product.price*1.1).toFixed())}<span>đ</span></span>
                    <span class="home-product-item__price-current">${FormatDotNumber(product.price)}<span>đ</span></span>
                </div>
                <div class="home-product-item__action">
                    <div class="home-product-item__like home-product-item__like-liked">
                        <i class="home-product-item__like-icon-empty fa-regular fa-heart"></i>
                        <i class="home-product-item__like-icon-fill fa-solid fa-heart"></i>
                    </div>

                    <div class="home-product-item__rating">
                        <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                        <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                        <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                        <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
                        <i class="home-product-item__rating-icon fa-solid fa-star"></i>
                    </div>

                    <!-- <span class="home-product-item__sold">88 đã bán</span> -->
                </div>
                <!-- <div class="home-product-item__origin">
                    <span class="home-product-item__origin-brand">Sony</span>
                    <span class="home-product-item__origin-name">Nhật Bản</span>
                </div> -->
                <div class="home-product-item__sale-off">
                    <span class="home-product-item__sale-label">SALE</span>
                    <span class="home-product-item__sale-percent">10%</span>
                </div>
                <div class="home-product-item__oder">
                    <button class="home-product-item__oder-btn">ĐẶT HÀNG NGAY</button>
                </div>
            </div>
        </div>
            `
        })
        productsList.innerHTML = html.join("") 
        return data
    })
    .then(clickQuickView)
}

// Xử lý khi click vào nút "xem nhanh" ở từng sản phẩm.
// Lưu ý: sau khi render mới xử lý ( do sau khi render mới có sản phẩm )
function clickQuickView(data) {
    var quickViewBtn = document.querySelectorAll('.js-quick-view-btn')
    var productChildList = Array.from(productsList.children)

    for(var i=0; i<quickViewBtn.length; i++) {
        quickViewBtn[i].onclick = function(e) {
            var indx = productChildList.indexOf(e.target.closest('.product-item-container'))

            loadQuickView(data[indx])
            e.preventDefault()
            quickViewModal.style.display = "block";
            document.querySelector('.quick-view-content').style.display = "flex"
            // manageProduct.style.display = "none"

            //quick view close
            var quickViewOverlay = document.querySelector('.js-quick-view__overlay')
            quickViewOverlay.onclick = function() {
                quickViewModal.style.display = "none"   
                document.querySelector('.quick-view-content').style.display = "none"
            }

            // Lấy số lượng sản phẩm
            var quantity = Number.parseInt(document.querySelector('.quick-view__product-quantity').innerText)

            // Xử lý nút tăng số lượng khi chọn sản phẩm
            var addBtn = document.querySelector('.quick-view__quantity-add')
            addBtn.onclick = function() {
                var inputQuantity = document.querySelector('.quick-view__quantity-number')
                var num = Number.parseInt(inputQuantity.value)
                if(num < quantity) {
                    num += 1
                    inputQuantity.value = num
                } else {
                    alert("Số lượng không hợp lệ!!!")
                }
            }

            // Xử lý nút giảm số lượng khi chọn sản phẩm
            var subBtn = document.querySelector('.quick-view__quantity-sub')
            subBtn.onclick = function() {
                var inputQuantity = document.querySelector('.quick-view__quantity-number')
                var num = Number.parseInt(inputQuantity.value)
                if(num > 0 && num <= quantity) {
                    num -= 1
                    inputQuantity.value = num
                } else {
                    alert("Số lượng không hợp lệ!!!")
                }
            }
        }
    }
}


function loadQuickView(product) {
    var html = `
        <div class="quick-view-content">
            <ul class="quick-view__img-list">
                <li class="quick-view__img-item  quick-view__img-item--active">
                    <img src="${product.imgThump}" alt="" class="quick-view__img">
                </li>
            </ul>
            <div class="quick-view__wapper">
                <div class="quick-view__heading">${product.name}</div>
                <div class="quick-view__price">
                    ${FormatDotNumber(product.price)}
                    <span class="quick-view__price-tail">đ</span>
                </div>
                <table class="quick-view__table">
                    <tr>
                        <th>Tình trạng</th>
                        <td>${product.state}</td>
                    </tr>
                    <tr>
                        <th>Phụ kiện</th>
                        <td>${product.accessories}</td>
                    </tr>
                    <tr>
                        <th>Bảo hành</th>
                        <td>${product.warranty}</td>
                    </tr>
                    <tr>
                        <th>Số lượng</th>
                        <td class="quick-view__product-quantity">${product.quantity}</td>
                    </tr>
                </table>
                <div class="quick-view__quantity">
                    <span class="quick-view__quantity-label">Số lượng: </span>
                    <button class="quick-view__quantity-btn quick-view__quantity-sub">-</button>
                    <input type="number" name="" id="" class="quick-view__quantity-number" value="0">
                    <button class="quick-view__quantity-btn quick-view__quantity-add">+</button>
                </div>
                <div class="quick-view__sumary">
                    <span class="quick-view__sumary-label">Thành tiền: </span>
                    <span class="quick-view__sumary-sum">${0}<span class="quick-view__price-tail">đ</span></span>
                </div>
                <div class="quick-view__add-to-cart">
                    <button class="quick-view__add-btn">THÊM VÀO GIỎ HÀNG</button>
                </div>
            </div>
        </div>
    `

    document.querySelector('.quick-view').innerHTML = html 
}


// Format chữ số hiển thị giá ( thêm dấu "." ngăn cách các hàng chữ số )
function FormatDotNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

