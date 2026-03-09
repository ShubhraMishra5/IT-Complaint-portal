from flask import Flask
from flask_cors import CORS
from extensions import db, login_manager, migrate
from auth.routes import auth_bp
from complaints.routes import complaint_bp
from config import Config
from dashboard.routes import dashboard_bp
import logging
logging.basicConfig(level=logging.DEBUG)





def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    CORS(app, resources={r"/dashboard/*": {"origins": "*"}}, supports_credentials=True)


    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(complaint_bp, url_prefix='/complaints')
    app.register_blueprint(dashboard_bp)
    

    return app

# Run only if this is the main file
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)


