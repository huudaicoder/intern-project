import chai from 'chai';
import jwt from 'jsonwebtoken';
import chaiHttp from 'chai-http';
import server from '../index.js';
import Group from '../models/Group.js';

chai.should();
chai.use(chaiHttp);

let id;

describe('3. Group - /api/v1/groups', () => {
  // Test tạo group mới
  describe('3.1. POST / - Tạo một group mới', () => {
    it('Tạo group thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const group = {
        name: 'HTV',
      };
      chai
        .request(server)
        .post('/api/v1/groups')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Group has been created.');
          done();
        });
    });

    it('Lỗi khi tạo group trùng lặp', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const group = {
        name: 'VTV',
      };
      chai
        .request(server)
        .post('/api/v1/groups')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string(
              'duplicate key error collection: test.groups index: name_1 dup key'
            );
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const group = {
        name: 'HTV',
      };
      chai
        .request(server)
        .post('/api/v1/groups')
        .send(group)
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
      const group = {
        name: 'HTV',
      };
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .post('/api/v1/groups')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(group)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test lấy thông tin tất cả group
  describe('3.2. GET / - Lấy thông tin tất cả group', () => {
    it('Lấy thông tin thành công', (done) => {
      chai
        .request(server)
        .get('/api/v1/groups')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });
  });

  // Test lấy thông tin một group
  describe('3.3. GET /:id - Lấy thông tin một group', () => {
    it('Lấy thông tin thành công', (done) => {
      const groupId = '632d351ae0aafca9a527cdb7';
      chai
        .request(server)
        .get(`/api/v1/groups/${groupId}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('_id').eq(groupId);
          res.body.should.have.property('name');
          res.body.should.have.property('channels');
          done();
        });
    });

    it('Lỗi không tìm thấy group', (done) => {
      const groupId = '63271d1acc70b9f64eaaf636';
      chai
        .request(server)
        .get(`/api/v1/groups/${groupId}`)
        .end((err, res) => {
          res.body.should.have.property('success').eq(false);
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Group not found!');
          done();
        });
    });

    it('Lỗi điền sai định dạng id của group', (done) => {
      const groupId = '63271d1acc70b9f64eaaf63';
      chai
        .request(server)
        .get(`/api/v1/groups/${groupId}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eq(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });
  });

  // Test sửa một group
  describe('3.4. PUT /:id - Sửa một group', () => {
    it('Sửa group thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const groupId = '632d351ae0aafca9a527cdb7';
      const group = {
        name: 'VTV CAB',
      };
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Group has been updated.');
          done();
        });
    });

    it('Không tìm thấy group', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const groupId = '632bc9038f53a8e49d19c7b7';
      const group = {
        name: 'VTV CAB',
      };
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Group not found!');
          done();
        });
    });

    it('Sửa tên trùng với group khác', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const groupId = '632d351ae0aafca9a527cdb7';
      const group = {
        name: 'VTV',
      };
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string(
              'duplicate key error collection: test.groups index: name_1 dup key'
            );
          done();
        });
    });

    it('Lỗi điền sai định dạng id của group', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const groupId = '632d351ae0aafca9a527cdb';
      const group = {
        name: 'VTV CAB',
      };
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(group)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eq(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const groupId = '632d351ae0aafca9a527cdb7';
      const group = {
        name: 'VTV CAB',
      };
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .send(group)
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
      const groupId = '632d351ae0aafca9a527cdb7';
      const group = {
        name: 'VTV CAB',
      };
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .put(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(group)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test xóa một group
  describe('3.5. DELETE /:id - Xóa một group', () => {
    before(async () => {
      const group = await Group.findOne({ name: 'HTV' });
      id = group.id;
    });

    it('Xóa group thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .delete(`/api/v1/groups/${id}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Group has been deleted.');
          done();
        });
    });

    it('Không tìm thấy group', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const groupId = '632ad953f02acd3e1d20b2b1';
      chai
        .request(server)
        .delete(`/api/v1/groups/${groupId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('Group Not Found');
          done();
        });
    });

    it('Lỗi khi sai định dạng id group', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .delete('/api/v1/groups/632ad953f02acd3e1d20b2b')
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eq(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      chai
        .request(server)
        .delete('/api/v1/groups/632d3521e0aafca9a527cdb9')
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
        .delete('/api/v1/groups/632d3521e0aafca9a527cdb9')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });
});
