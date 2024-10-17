import chai from 'chai';
import jwt from 'jsonwebtoken';
import chaiHttp from 'chai-http';
import server from '../index.js';
import Program from '../models/Program.js';

const should = chai.should();

let id;

chai.use(chaiHttp);

describe('4. Program - /api/v1/programs', () => {
  // Test tạo program mới
  describe('4.1. POST/ - Tạo một program mới', () => {
    it('Tạo program thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d36cae0aafca9a527cde4';
      const program = {
        name: 'thoi su 11h',
        timeStart: '2022-09-23 12:00:00',
        timeFinish: '2022-09-23 12:30:00',
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .post(`/api/v1/programs/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Program has been created.');
          done();
        });
    });
    it('Lỗi trùng thời gian chiếu', (done) => {
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      const channelId = '632d3619e0aafca9a527cdce';
      const program = {
        name: 'thoi su 12h',
        timeStart: '2022-09-23 12:00:00',
        timeFinish: '2022-09-23 12:30:00',
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .post(`/api/v1/programs/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('This time was busy!');
          done();
        });
    });
    it('Lỗi không tìm được channel', (done) => {
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      const channelId = '632c22ddd4b3bca7d0a39528';
      const program = {
        name: 'thoi su 11h',
        timeStart: '2022-09-23 11:00:00',
        timeFinish: '2022-09-23 11:30:00',
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .post(`/api/v1/programs/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Channel not Found');
          done();
        });
    });
    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const channelId = '632c22ddd4b3bca7d0a39528';
      const program = {
        name: 'thoi su 11h',
        timeStart: '2022-09-23 11:00:00',
        timeFinish: '2022-09-23 11:30:00',
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .post(`/api/v1/programs/${channelId}`)
        .send(program)
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
      const channelId = '632c22ddd4b3bca7d0a39528';
      const program = {
        name: 'thoi su 11h',
        timeStart: '2022-09-23 11:00:00',
        timeFinish: '2022-09-23 11:30:00',
        source: 'fufhfdehie3',
      };
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .post(`/api/v1/programs/${channelId}`)
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(program)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });
  describe('4.2. GET /current/:channelId - Lấy thông tin program đang phát trên 1 channel', () => {
    it('Lấy thông tin thành công', (done) => {
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      const channelId = '632d3619e0aafca9a527cdce';
      chai
        .request(server)
        .get(`/api/v1/programs/current/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('channelId').eq(channelId);
          res.body.should.have.property('timeStart');
          res.body.should.have.property('timeFinish');
          res.body.should.have.property('source');
          done();
        });
    });
    it('Lỗi không tìm được program', (done) => {
      const channelId = '632d36cae0aafca9a527cde4';
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      chai
        .request(server)
        .get(`/api/v1/programs/current/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Program Not Found');
          done();
        });
    });
    it('Lỗi không tìm được channel', (done) => {
      const channelId = '632bc8f38f53a8e49d19c7a3';
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      chai
        .request(server)
        .get(`/api/v1/programs/current/${channelId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Channel Not Found');
          done();
        });
    });
    it('Lỗi sai định dạng id của channel', (done) => {
      const channelId = '632bc8f38f53a8e49d19c7a';
      const token = jwt.sign({ id: 'user.id' }, process.env.JWT);
      chai
        .request(server)
        .get(`/api/v1/programs/current/${channelId}`)
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
  });
  describe('4.3. GET /find/:channelId - Lấy thông tin tất cả program của 1 channel trong 1 ngày', () => {
    it('Lấy thông tin thành công', (done) => {
      const channelId = '632d3619e0aafca9a527cdce';
      chai
        .request(server)
        .get(`/api/v1/programs/find/${channelId}/?day=2022-09-25`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });
    it('Lỗi không lấy được program', (done) => {
      const channelId = '632fbf6fdad5d3163b28aed7';
      chai
        .request(server)
        .get(`/api/v1/programs/find/${channelId}/?day=2022-09-25`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Program Not Found');
          done();
        });
    });
    it('Lỗi do không tìm được channel', (done) => {
      const channelId = '632bc8f38f53a8e49d19c7a3';
      chai
        .request(server)
        .get(`/api/v1/programs/find/${channelId}/?day=2022-09-25`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Channel Not Found');
          done();
        });
    });
    it('Lỗi do nhập sai định dạng id của channel', (done) => {
      const channelId = '632bc8f38f53a8e49d19c7a';
      chai
        .request(server)
        .get(`/api/v1/programs/find/${channelId}/?day=2022-09-25`)
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
  describe('4.4. GET/:id- Lấy thông tin của 1 program ', () => {
    it('Lấy thông tin program thành công', (done) => {
      const programId = '632d364ae0aafca9a527cdd5';
      chai
        .request(server)
        .get(`/api/v1/programs/${programId}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id').eq(programId);
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('timeStart');
          res.body.should.have.property('timeFinish');
          res.body.should.have.property('source');
          done();
        });
    });
    it('Lỗi không tìm thấy program', (done) => {
      const programId = '632d364ae0aafca9a527cdd9';
      chai
        .request(server)
        .get(`/api/v1/programs/${programId}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Program Not Found');
          done();
        });
    });
    it('Lỗi do nhập sai định dạng id của program', (done) => {
      const programId = '632d364ae0aafca9a527cdd';
      chai
        .request(server)
        .get(`/api/v1/programs/${programId}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('success').eql(false);
          done();
        });
    });
  });
  describe('4.5. PUT /:id - Cập nhật thông tin của 1 program', () => {
    it('Cập nhật program thành công ', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d364ae0aafca9a527cdd5';
      const program = {
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Program has been updated.');
          done();
        });
    });
    it('Không tìm thấy program', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d364ae0aafca9a527cd22';
      const program = {
        source: 'fufhfdehie2',
      };
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message').eq('Program not Found');
          done();
        });
    });
    it('Cập nhật thời gian trùng với program khác trong channel', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d364ae0aafca9a527cdd5';
      const program = {
        timeStart: '2022-09-23 11:25:00',
        timeFinish: '2022-09-23 12:10:00',
      };
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('This time was busy!');
          done();
        });
    });
    it('Lỗi điền sai định dạng id của program', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d364ae0aafca9a527cdd';
      const program = {
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .send(program)
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
      const programId = '632d364ae0aafca9a527cdd5';
      const program = {
        source: 'fufhfdehie3',
      };
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .send(program)
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
      const programId = '632d364ae0aafca9a527cdd5';
      const program = {
        source: 'fufhfdehie3',
      };
      const wrongToken = jwt.sign({ id: 'admin.id' }, 'abcabc');
      chai
        .request(server)
        .put(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .send(program)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });
  describe('4.6. DELETE /:id - Xóa một program', () => {
    before(async () => {
      const program = await Program.findOne({
        name: 'thoi su 11h',
        timeStart: new Date('2022-09-23 12:00:00').getTime(),
      });
      id = program.id;
    });
    it('Xoá program thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      chai
        .request(server)
        .delete(`/api/v1/programs/${id}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.eql('Program has been deleted.');
          done();
        });
    });
    it('Lỗi không tìm thấy program', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d2b8eea074e5809b5b812';
      chai
        .request(server)
        .delete(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('Not Found');
          done();
        });
    });
    it('Lỗi khi sai định dạng id group', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const programId = '632d2b8eea074e5809b5b8';
      chai
        .request(server)
        .delete(`/api/v1/programs/${programId}`)
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
      const programId = '632d356ae0aafca9a527cdbe';
      chai
        .request(server)
        .delete(`/api/v1/programs/${programId}`)
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
      const programId = '632d356ae0aafca9a527cdbe';
      chai
        .request(server)
        .delete(`/api/v1/programs/${programId}`)
        .set('Cookie', `adminAccessToken=${wrongToken}`)
        .end((err, res) => {
          res.body.should.have.property('success').eql(false);
          res.should.have.status(403);
          res.body.should.have.property('message').eql('Token is not valid!');
          done();
        });
    });
  });
  describe('4.7. DELETE /date/:channelId - Xóa video của tất cả program trong 1 ngày của 1 channel', () => {
    it('Xoá thành công', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d36cae0aafca9a527cde4';
      chai
        .request(server)
        .delete(`/api/v1/programs/date/${channelId}/?day=2022-09-18`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          done();
        });
    });
    it('Lỗi không tìm thấy program', (done) => {
      const token = jwt.sign({ id: 'admin.id' }, process.env.JWT);
      const channelId = '632d36cae0aafca9a527cde2';
      chai
        .request(server)
        .delete(`/api/v1/programs/date/${channelId}/?day=2022-09-25`)
        .set('Cookie', `adminAccessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('message').eq('Not Found');
          done();
        });
    });
    it('Lỗi khi admin chưa đăng nhập', (done) => {
      const channelId = '632d36cae0aafca9a527cde2';
      chai
        .request(server)
        .delete(`/api/v1/programs/date/${channelId}/?day=2022-09-25`)
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
      const channelId = '632d36cae0aafca9a527cde2';
      chai
        .request(server)
        .delete(`/api/v1/programs/date/${channelId}/?day=2022-09-25`)
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
