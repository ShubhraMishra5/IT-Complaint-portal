from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from apscheduler.schedulers.background import BackgroundScheduler
from flask_migrate import Migrate

migrate = Migrate()

db = SQLAlchemy()
login_manager = LoginManager()
scheduler = BackgroundScheduler()



if not scheduler.running:
    scheduler.start()

def init_extensions(app):
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    if not scheduler.running:
        scheduler.start()
