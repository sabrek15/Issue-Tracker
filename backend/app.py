from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sqlalchemy
from sqlalchemy import create_engine, Column, String, DateTime, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import os  # Import the os module to access environment variables
from dotenv import load_dotenv  # Import the load_dotenv function

# Load environment variables from .env file at the top of the script
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- DATABASE SETUP ---
# Read the database URL from the environment variable.
# Provide a default value (though it's better to always have .env set).
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@host/db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLALCHEMY ORM MODEL ---
class Issue(Base):
    __tablename__ = 'issues'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default='Open')
    priority = Column(String(50), nullable=False, default='Medium')
    assignee = Column(String(100))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=sqlalchemy.func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now())

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'status': self.status,
            'priority': self.priority,
            'assignee': self.assignee,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

# --- HEALTH CHECK ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

# --- COMBINED /issues ROUTE ---
@app.route('/issues', methods=['GET', 'POST'])
def issues_route():
    db_session = SessionLocal()
    try:
        if request.method == 'POST':
            data = request.get_json()
            if not data or 'title' not in data or not data['title'].strip():
                return jsonify({"error": "Title is required"}), 400
            
            new_issue = Issue(
                title=data['title'], status=data.get('status', 'Open'),
                priority=data.get('priority', 'Medium'), assignee=data.get('assignee', '')
            )
            db_session.add(new_issue)
            db_session.commit()
            db_session.refresh(new_issue)
            return jsonify(new_issue.to_dict()), 201

        if request.method == 'GET':
            query_params = request.args
            query = db_session.query(Issue)
            if 'search' in query_params: query = query.filter(Issue.title.ilike(f"%{query_params['search']}%"))
            if 'status' in query_params and query_params['status']: query = query.filter(Issue.status == query_params['status'])
            if 'priority' in query_params and query_params['priority']: query = query.filter(Issue.priority == query_params['priority'])
            if 'assignee' in query_params: query = query.filter(Issue.assignee.ilike(f"%{query_params['assignee']}%"))
            if 'sort' in query_params:
                sort_key = query_params['sort']
                sort_order = query_params.get('order', 'asc')
                if hasattr(Issue, sort_key):
                    column = getattr(Issue, sort_key)
                    query = query.order_by(column.desc() if sort_order == 'desc' else column.asc())
            
            page = int(query_params.get('page', 1))
            page_size = int(query_params.get('pageSize', 10))
            offset = (page - 1) * page_size
            issues = query.offset(offset).limit(page_size).all()
            return jsonify([issue.to_dict() for issue in issues])
    finally:
        db_session.close()

# --- GET/PUT by ID ROUTES ---
@app.route('/issues/<string:issue_id>', methods=['GET', 'PUT'])
def issue_detail_route(issue_id):
    db_session = SessionLocal()
    try:
        # ** FIXED: Use session.get() instead of query().get() **
        issue_to_update = db_session.get(Issue, issue_id)
        if issue_to_update is None:
            return jsonify({"error": "Issue not found"}), 404

        if request.method == 'GET':
            return jsonify(issue_to_update.to_dict())

        if request.method == 'PUT':
            data = request.get_json()
            if not data or 'title' not in data or not data['title'].strip():
                return jsonify({"error": "Title is required"}), 400
            
            issue_to_update.title = data.get('title', issue_to_update.title)
            issue_to_update.status = data.get('status', issue_to_update.status)
            issue_to_update.priority = data.get('priority', issue_to_update.priority)
            issue_to_update.assignee = data.get('assignee', issue_to_update.assignee)
            
            db_session.commit()
            db_session.refresh(issue_to_update)
            return jsonify(issue_to_update.to_dict())
    finally:
        db_session.close()

if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    app.run(debug=True)