import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import server from '../index.js';
import Admin from '../models/Admin.js';

chai.should();
chai.use(chaiHttp);

describe('1. Admin - /api/v1/admins', () => {
  // Test đăng nhập
  describe('1.1. POST /login - Đăng nhập của admin', () => {
    it('Đăng nhập thành công', (done) => {
      chai
        .request(server)
        .post('/api/v1/admins/login')
        .send({
          account: '0999999999',
          password: '000000',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Login successfully!');
          done();
        });
    });

    it('Không tìm thấy tài khoản', (done) => {
      const wrongAdmin = {
        account: '0999999000',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/admins/login')
        .send(wrongAdmin)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(404);
          res.body.should.have.property('message').eql('Admin not found!');
          done();
        });
    });

    it('Sai mật khẩu', (done) => {
      const wrongAdmin = {
        account: '0999999999',
        password: '000001',
      };
      chai
        .request(server)
        .post('/api/v1/admins/login')
        .send(wrongAdmin)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(400);
          res.body.should.have
            .property('message')
            .eql('Wrong password or username!');
          done();
        });
    });
  });

  // Test đăng xuất
  describe('1.2. GET /logout - Đăng xuất của admin', () => {
    it('Đăng xuất thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .get('/api/v1/admins/logout')
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Logout successfully!');
          done();
        });
    });

    it('Lỗi khi chưa đăng nhập', (done) => {
      chai
        .request(server)
        .get('/api/v1/admins/logout')
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(401);
          res.body.should.have
            .property('message')
            .eql('You are not authenticated!');
          done();
        });
    });

    it('Lỗi khi request chứa verify token sai', (done) => {
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .get('/api/v1/admins/logout')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test tạo tài khoản
  describe('1.3. POST / - Tạo một tài khoản admin', () => {
    it('Tạo tài khoản thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const admin = {
        account: '0888888888',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/admins')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(admin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Admin has been created.');
          done();
        });
    });

    it('Tạo tài khoản với trường required bị thiếu', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const wrongAdmin = {
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/admins')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(wrongAdmin)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(500);
          res.body.should.have
            .property('message')
            .eql(
              'Admin validation failed: account: Path `account` is required.'
            );
          done();
        });
    });

    it('Tạo tài khoản với trường account bị trùng lặp', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const wrongAdmin = {
        account: '0999999999',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/admins')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(wrongAdmin)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(500);
          res.body.should.have
            .property('message')
            .eql(
              'E11000 duplicate key error collection: test.admins index: account_1 dup key: { account: "0999999999" }'
            );
          done();
        });
    });

    it('Lỗi khi chưa đăng nhập', (done) => {
      chai
        .request(server)
        .post('/api/v1/admins')
        .send({
          account: '0888888888',
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(401);
          res.body.should.have
            .property('message')
            .eql('You are not authenticated!');
          done();
        });
    });

    it('Lỗi khi request chứa verify token sai', (done) => {
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .post('/api/v1/admins')
        .send({
          account: '0888888888',
          password: '000000',
        })
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test lấy thông tin all admin
  describe('1.4. GET / - Lấy thông tin tất cả admin', () => {
    it('Lấy thông tin thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .get('/api/v1/admins')
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });

    it('Lỗi khi chưa đăng nhập', (done) => {
      chai
        .request(server)
        .get('/api/v1/admins')
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(401);
          res.body.should.have
            .property('message')
            .eql('You are not authenticated!');
          done();
        });
    });

    it('Lỗi khi request chứa verify token sai', (done) => {
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .get('/api/v1/admins')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test đổi mật khẩu admin
  describe('1.5. PUT /:id - Đổi mật khẩu của một admin', () => {
    it('Admin đổi mật khẩu của bản thân thành công', (done) => {
      const token = jwt.sign(
        { id: '632c94d4bd285c85c2061f13' },
        process.env.JWT
      );
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f13')
        .set('Cookie', `adminAccessToken=${token}`)
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Password has been changed.');
          done();
        });
    });

    it('Lỗi khi admin đổi mật khẩu của admin khác', (done) => {
      const token = jwt.sign(
        { id: '632c94d4bd285c85c2061f12' },
        process.env.JWT
      );
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f13')
        .set('Cookie', `adminAccessToken=${token}`)
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have
            .property('message')
            .eql('You are not authorized!');
          done();
        });
    });

    it('Không tìm thấy tài khoản', (done) => {
      const token = jwt.sign(
        { id: '632c94d4bd285c85c2061f12' },
        process.env.JWT
      );
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f12')
        .set('Cookie', `adminAccessToken=${token}`)
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(404);
          res.body.should.have.property('message').eql('Admin not found!');
          done();
        });
    });

    it('Lỗi điền sai định dạng id', (done) => {
      const token = jwt.sign(
        { id: '632c94d4bd285c85c2061f1' },
        process.env.JWT
      );
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f1')
        .set('Cookie', `adminAccessToken=${token}`)
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(500);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });

    it('Lỗi khi thiếu trường password', (done) => {
      const token = jwt.sign(
        { id: '632c94d4bd285c85c2061f13' },
        process.env.JWT
      );
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f13')
        .set('Cookie', `adminAccessToken=${token}`)
        .send({})
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(400);
          res.body.should.have
            .property('message')
            .eql('New password required!');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f13')
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(401);
          res.body.should.have
            .property('message')
            .eql('You are not authenticated!');
          done();
        });
    });

    it('Lỗi khi request chứa verify token sai', (done) => {
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .put('/api/v1/admins/632c94d4bd285c85c2061f13')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send({
          password: '000000',
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  after(async () => {
    await Admin.findOneAndRemove({ account: '0888888888' });
  });
});
