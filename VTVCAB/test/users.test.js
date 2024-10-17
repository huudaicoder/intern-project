import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import server from '../index.js';
import User from '../models/User.js';

chai.should();
chai.use(chaiHttp);

describe('5. User - /api/v1/users', () => {
  // Test tạo tài khoản
  describe('5.1. POST / - Tạo một tài khoản user', () => {
    it('Tạo tài khoản thành công', (done) => {
      const user = {
        name: 'Nguyễn Văn A',
        phone: '0123456780',
        gender: 'Nam',
        city: 'Hà Nội',
        birthday: '9-1-2001',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('User has been created.');
          done();
        });
    });

    it('Tạo tài khoản với trường required bị thiếu', (done) => {
      const wrongUser = {
        phone: '0123456777',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/users')
        .send(wrongUser)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(500);
          res.body.should.have
            .property('message')
            .eql(
              'User validation failed: birthday: Path `birthday` is required., city: Path `city` is required., gender: Path `gender` is required., name: Path `name` is required.'
            );
          done();
        });
    });

    it('Tạo tài khoản với trường phone bị trùng lặp', (done) => {
      const wrongUser = {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        gender: 'Nam',
        city: 'Hà Nội',
        birthday: '9-1-2001',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/users')
        .send(wrongUser)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(500);
          res.body.should.have
            .property('message')
            .eql(
              'E11000 duplicate key error collection: test.users index: phone_1 dup key: { phone: "0123456789" }'
            );
          done();
        });
    });
  });

  // Test đăng nhập
  describe('5.2. POST /login - Đăng nhập của user', () => {
    it('Đăng nhập thành công', (done) => {
      chai
        .request(server)
        .post('/api/v1/users/login')
        .send({
          phone: '0123456789',
          password: '000000',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Login successfully!');
          done();
        });
    });

    it('Không tìm thấy tài khoản', (done) => {
      const wrongUser = {
        phone: '0123456000',
        password: '000000',
      };
      chai
        .request(server)
        .post('/api/v1/users/login')
        .send(wrongUser)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(404);
          res.body.should.have.property('message').eql('User not found!');
          done();
        });
    });

    it('Sai mật khẩu', (done) => {
      const wrongUser = {
        phone: '0123456780',
        password: '000001',
      };
      chai
        .request(server)
        .post('/api/v1/users/login')
        .send(wrongUser)
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
  describe('5.3. GET /logout - Đăng xuất của user', () => {
    it('Đăng xuất thành công', (done) => {
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      chai
        .request(server)
        .get('/api/v1/users/logout')
        .set('Cookie', `userAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Logout successfully!');
          done();
        });
    });

    it('Lỗi khi chưa đăng nhập', (done) => {
      chai
        .request(server)
        .get('/api/v1/users/logout')
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
      const wrongToken = jwt.sign({ id: 'user.id' }, 'abcabc');
      chai
        .request(server)
        .get('/api/v1/users/logout')
        .set('Cookie', `userAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test lấy thông tin all user
  describe('5.4. GET / - Admin lấy thông tin tất cả user', () => {
    it('Admin lấy thông tin thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .get('/api/v1/users')
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      chai
        .request(server)
        .get('/api/v1/users')
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
        .get('/api/v1/users')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test lấy thông tin một user
  describe('5.5. GET /:id - Admin/User lấy thông tin của một user', () => {
    describe('5.5.1. Admin lấy thông tin của một user', () => {
      it('Admin lấy thông tin thành công', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `adminAccessToken=${token}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });

      it('Không tìm thấy tài khoản', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a3')
          .set('Cookie', `adminAccessToken=${token}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(404);
            res.body.should.have.property('message').eql('User not found!');
            done();
          });
      });

      it('Lỗi khi điền sai định dạng id', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a')
          .set('Cookie', `adminAccessToken=${token}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(500);
            res.body.should.have
              .property('message')
              .to.have.string('Cast to ObjectId failed for value');
            done();
          });
      });

      it('Lỗi khi admin chưa đăng nhập', (done) => {
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
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
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `adminAccessToken=${wrongToken}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(403);
            res.body.should.have.property('message').eql('Token is not valid!');
            done();
          });
      });
    });

    describe('5.5.2. User lấy thông tin của một user', () => {
      it('User lấy thông tin của bản thân thành công', (done) => {
        const token = jwt.sign(
          { id: '632bc6d1ea22e898232783a4' },
          process.env.JWT
        );
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${token}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });

      it('Lỗi khi user lấy thông tin của người khác', (done) => {
        const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${token}`)
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
          { id: '632bc6d1ea22e898232783a3' },
          process.env.JWT
        );
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a3')
          .set('Cookie', `userAccessToken=${token}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(404);
            res.body.should.have.property('message').eql('User not found!');
            done();
          });
      });

      it('Lỗi khi điền sai định dạng id', (done) => {
        const token = jwt.sign(
          { id: '632bc6d1ea22e898232783a' },
          process.env.JWT
        );
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a')
          .set('Cookie', `userAccessToken=${token}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(500);
            res.body.should.have
              .property('message')
              .to.have.string('Cast to ObjectId failed for value');
            done();
          });
      });

      it('Lỗi khi user chưa đăng nhập', (done) => {
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
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
        const wrongToken = jwt.sign({ id: 'user.id' }, 'abcabc');
        chai
          .request(server)
          .get('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${wrongToken}`)
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(403);
            res.body.should.have.property('message').eql('Token is not valid!');
            done();
          });
      });
    });
  });

  // Test sửa thông tin một user
  describe('5.6. PUT /:id - Admin/User sửa thông tin của một user', () => {
    describe('5.6.1. Admin sửa thông tin của một user', () => {
      it('Admin sửa thông tin thành công', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `adminAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.eql('Information has been updated.');
            done();
          });
      });

      it('Không tìm thấy tài khoản', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a3')
          .set('Cookie', `adminAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(404);
            res.body.should.have.property('message').eql('User not found!');
            done();
          });
      });

      it('Lỗi khi điền sai định dạng id', (done) => {
        const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a')
          .set('Cookie', `adminAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
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

      it('Lỗi khi admin chưa đăng nhập', (done) => {
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .send({
            city: 'Hà Nội',
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
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `adminAccessToken=${wrongToken}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(403);
            res.body.should.have.property('message').eql('Token is not valid!');
            done();
          });
      });
    });

    describe('5.6.2. User sửa thông tin của một user', () => {
      it('User sửa thông tin của bản thân thành công', (done) => {
        const token = jwt.sign(
          { id: '632bc6d1ea22e898232783a4' },
          process.env.JWT
        );
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.eql('Information has been updated.');
            done();
          });
      });

      it('Lỗi khi user sửa thông tin của người khác', (done) => {
        const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
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
          { id: '632bc6d1ea22e898232783a3' },
          process.env.JWT
        );
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a3')
          .set('Cookie', `userAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(404);
            res.body.should.have.property('message').eql('User not found!');
            done();
          });
      });

      it('Lỗi khi điền sai định dạng id', (done) => {
        const token = jwt.sign(
          { id: '632bc6d1ea22e898232783a' },
          process.env.JWT
        );
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a')
          .set('Cookie', `userAccessToken=${token}`)
          .send({
            city: 'Hà Nội',
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

      it('Lỗi khi user chưa đăng nhập', (done) => {
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .send({
            city: 'Hà Nội',
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
        const wrongToken = jwt.sign({ id: 'user.id' }, 'abcabc');
        chai
          .request(server)
          .put('/api/v1/users/632bc6d1ea22e898232783a4')
          .set('Cookie', `userAccessToken=${wrongToken}`)
          .send({
            city: 'Hà Nội',
          })
          .end((err, res) => {
            res.body.should.have.property('success').eql(false);
            res.should.have.status(403);
            res.body.should.have.property('message').eql('Token is not valid!');
            done();
          });
      });
    });
  });

  after(async () => {
    await User.findOneAndRemove({ phone: '0123456780' });
  });
});
