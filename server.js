const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('qs');

const server = http.createServer((req, res) => {
    let urlParse = url.parse(req.url, true); // Đối tượng chứa các thông tin của đường link mà mình tương tác
    let pathName = urlParse.pathname // trả về /home/0
    // let trimPath = pathName.replace(/^\/+|\/+$/g, '');
    let arrPath = pathName.split('/'); // 0/1/2 ~ /home/ : home ở v trí 1
    let trimPath = arrPath[1];
    let chosenHandler;
    if (typeof router[trimPath] === 'undefined') {
        chosenHandler = handler.notFound;
    } else {
        chosenHandler = router[trimPath];
    }
    chosenHandler(req, res, arrPath[2])
})

let handler = {};

handler.login = (req, res) => {

}

handler.home = (req, res) => {
    let userHtml = '';
    fs.readFile('./data/user.json', "utf-8", (err, users) => {
        users = JSON.parse(users);
        users.forEach((item, index) => {
            userHtml += `${index + 1} : ${item.name} - ${item.password} <a href="edit/${index}">Sửa</a> - <a href="delete/${index}">Xóa</a> <br>`
        });
        fs.readFile('./views/index.html', 'utf-8', (err, indexHtml) => {
            res.writeHead(200, 'text/html');
            indexHtml = indexHtml.replace('{users}', userHtml);
            res.write(indexHtml);
            res.end();
        })
    })
}

handler.notFound = (req, res) => {
    fs.readFile('./views/notFound.html', 'utf-8', (err, data) => {
        res.writeHead(200, 'text/html');
        res.write(data);
        res.end();
    })
}

handler.register = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile('./views/register.html', "utf-8", (err, data) => {
            res.writeHead(200, 'text/html');
            res.write(data);
            res.end();
        })
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            let users = [];
            const userInfo = qs.parse(data); // trả dữ lệu về theo kiểu đối tượng
            fs.readFile('./data/user.json','utf-8', (err, usersJson) => {
                users = JSON.parse(usersJson);
                users.push(userInfo);
                users = JSON.stringify(users); // chuyển về kiểu json mơ lưu đc vào file json
                fs.writeFile('./data/user.json', users, err => {
                    console.log(err)
                });
            });
        });
        res.writeHead(301, {'location': '/home'});
        res.end();
    }
};

handler.edit = (req, res, index) => {
    if(req.method === 'GET') {
        fs.readFile('./views/edit.html','utf-8', (err, data) => {
            res.writeHead(200, 'text/html');
            res.write(data);
            res.end();
        })
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            let users = [];
            const userInfo = qs.parse(data);
            fs.readFile('./data/user.json','utf-8', (err, userJson) => {
                users = JSON.parse(userJson);
                for (let i = 0; i < users.length; i++) {
                    if(i === +index) {
                        users[i] = userInfo;
                    }
                }
                users = JSON.stringify(users);
                fs.writeFile('./data/user.json',users,err => {
                    console.log(err)
                });
            })
        })
        res.writeHead(301, {'location': '/home'});

        res.end();
    }
}

let router = {
    'home': handler.home,
    'login': handler.login,
    'register': handler.register,
    'notFound': handler.notFound,
    'edit': handler.edit
}

server.listen(8080, () => {
    console.log('running');
})
