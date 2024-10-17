import chai from 'chai';
import jwt from 'jsonwebtoken';
import chaiHttp from 'chai-http';
import server from '../index.js';
import Channel from '../models/Channel.js';

chai.should();
chai.use(chaiHttp);

let id;

describe('2. Channel - /api/v1/channels', () => {
  // Test tạo channel
  describe('2.1. POST / - Tạo một channel', () => {
    it('Tạo channel thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channel = {
        name: 'VTV8',
        accessRight: false,
        source: 'fufhfdehie2',
        groups: ['632d2efa344d003a6733a46a', '632d34f2e0aafca9a527cdb3'],
      };
      chai
        .request(server)
        .post('/api/v1/channels')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Channel has been created.');
          done();
        });
    });

    it('Lỗi khi tạo channel trùng tên', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channel = {
        name: 'VTV1',
        accessRight: false,
        source: 'fufhfdehie3',
        groups: ['632d2efa344d003a6733a46a', '632d34f2e0aafca9a527cdb3'],
      };
      chai
        .request(server)
        .post('/api/v1/channels')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string(
              'duplicate key error collection: test.channels index: name_1 dup key'
            );
          done();
        });
    });

    it('Lỗi khi thiếu tên channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channel = {
        accessRight: false,
        source: 'fufhfdehie3',
        groups: ['632d2efa344d003a6733a46a', '632d34f2e0aafca9a527cdb3'],
      };
      chai
        .request(server)
        .post('/api/v1/channels')
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .eq('Channel validation failed: name: Path `name` is required.');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const channel = {
        name: 'VTV9',
        accessRight: false,
        source: 'fufhfdehie2',
        groups: ['632d2efa344d003a6733a46a', '632d34f2e0aafca9a527cdb3'],
      };
      chai
        .request(server)
        .post('/api/v1/channels')
        .send(channel)
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
      const channel = {
        name: 'VTV9',
        accessRight: false,
        source: 'fufhfdehie2',
        groups: ['632d2efa344d003a6733a46a', '632d34f2e0aafca9a527cdb3'],
      };
      chai
        .request(server)
        .post('/api/v1/channels')
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(channel)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test lấy danh sách channel theo group
  describe('2.2. GET /:groupId - Lấy danh sách channel theo group', () => {
    it('Lấy danh sách channel thành công', (done) => {
      const groupId = '632d2efa344d003a6733a46a';
      chai
        .request(server)
        .get(`/api/v1/channels/find/${groupId}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });

    it('Không tìm thấy group', (done) => {
      const groupId = '632bc8f38f53a8e49d19c7a3';
      chai
        .request(server)
        .get(`/api/v1/channels/find/${groupId}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Not Found');
          done();
        });
    });

    it('Lỗi điền sai định dạng id của group', (done) => {
      const groupId = '632d2efa344d003a6733a46';
      chai
        .request(server)
        .get(`/api/v1/channels/find/${groupId}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });
  });

  // Test lấy danh sách channel
  describe('2.3. GET / - Lấy danh sách channel', () => {
    it('Lấy danh sách thành công', (done) => {
      chai
        .request(server)
        .get('/api/v1/channels')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });
  });

  // Test lấy thông tin một channel
  describe('2.4. GET /:id - Lấy thông tin một channel', () => {
    it('Lấy thông tin một channel thành công', (done) => {
      const channelId = '632d3619e0aafca9a527cdce';
      chai
        .request(server)
        .get(`/api/v1/channels/${channelId}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('_id').eq(channelId);
          res.body.should.have.property('name');
          res.body.should.have.property('accessRight');
          res.body.should.have.property('source');
          done();
        });
    });

    it('Không tìm thấy channel', (done) => {
      const channelId = '632d1a3e6792c9c49378df96';
      chai
        .request(server)
        .get(`/api/v1/channels/${channelId}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Not Found');
          done();
        });
    });

    it('Lỗi điền sai định dạng id channel', (done) => {
      const channelId = '632d1a3e6792c9c49378df9';
      chai
        .request(server)
        .get(`/api/v1/channels/${channelId}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });
  });

  // Test chỉnh sửa một channel
  describe('2.5. PUT /:id - Chỉnh sửa một channel', () => {
    it('Chỉnh sửa thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d3711e0aafca9a527cdf4';
      const channel = {
        accessRight: 'false',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Channel has been updated.');
          done();
        });
    });

    it('Không tìm thấy channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632124e8c318043c514a60b6';
      const channel = {
        accessRight: 'false',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Channel Not Found');
          done();
        });
    });

    it('Chỉnh sửa tên channel trùng lặp', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d3711e0aafca9a527cdf4';
      const channel = {
        name: 'VTV1',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string(
              'duplicate key error collection: test.channels index: name_1 dup key'
            );
          done();
        });
    });

    it('Lỗi sai định dạng id channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d3711e0aafca9a527cdf';
      const channel = {
        accessRight: 'false',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(channel)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const channelId = '632d3711e0aafca9a527cdf4';
      const channel = {
        accessRight: 'false',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .send(channel)
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
      const channelId = '632d3711e0aafca9a527cdf4';
      const channel = {
        accessRight: 'false',
      };
      chai
        .request(server)
        .put(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(channel)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });

  // Test xóa một channel
  describe('2.6. DELETE /:id - Xóa một channel', () => {
    before(async () => {
      const group = await Channel.findOne({ name: 'VTV8' });
      id = group.id;
    });

    it('Xóa thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .delete(`/api/v1/channels/${id}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Channel has been deleted.');
          done();
        });
    });

    it('Không tìm thấy channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d1a3e6792c9c49378df99';
      chai
        .request(server)
        .delete(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('Channel Not Found');
          done();
        });
    });

    it('Lỗi khi sai định dạng id channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d3711e0aafca9a527cd1';
      chai
        .request(server)
        .delete(`/api/v1/channels/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          res.body.should.have
            .property('message')
            .to.have.string('Cast to ObjectId failed for value');
          done();
        });
    });

    it('Lỗi khi admin chưa đăng nhập', (done) => {
      chai
        .request(server)
        .delete(`/api/v1/channels/${id}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(401);
          res.body.should.have
            .property('message')
            .eql('You are not authenticated!');
          done();
        });
    });

    it('Lỗi sai verify token', (done) => {
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .delete(`/api/v1/channels/${id}`)
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
