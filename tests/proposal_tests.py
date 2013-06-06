# coding=UTF-8
import os
import unittest
from application.default_settings import _basedir
from application import app, db

class FlaskrTestCase(unittest.TestCase):

    def setUp(self):
        create_db_dir = _basedir + '/db'
        if not os.path.exists(create_db_dir):
            os.mkdir(create_db_dir, 0755)
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = ('sqlite:///'
                                    + os.path.join(_basedir, 'db/tests.db'))
        self.app = app.test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_empty_db(self):
        rv = self.app.get('/')
        assert 'No entries here so far' in rv.data

    def test_index(self):
      rv = self.app.get('/')
      assert '전체' in rv.data

if __name__ == '__main__':
    unittest.main()
