from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float
from sqlalchemy.orm import declarative_base
import os

# Define base class for ORM models
Base = declarative_base()

class User(Base):
    __tablename__ = 'Users'
    Uid = Column(Integer, primary_key=True)
    email = Column(String(128), nullable=False, unique=True)
    password = Column(String(128), nullable=False)  # Hashed password
    school_name = Column(String(128), nullable=False)

# All setings related to the timetable generation
class Settings(Base):
    __tablename__ = 'Settings'
    Uid = Column(Integer, primary_key=True)
    prefer_early_hours = Column(Boolean, nullable=False)
    allow_block_scheduling = Column(Boolean, nullable=False)
    max_hours_per_day = Column(Integer, nullable=False)
    global_break = Column(Integer, nullable=False)
    weight_block_scheduling = Column(Integer, nullable=False)
    weight_time_of_hours = Column(Integer, nullable=False)
    max_time_for_solving = Column(Integer, nullable=False)

# School structure: classes and subjects
class School(Base):
    __tablename__ = 'School'
    Uid = Column(Integer, primary_key=True)
    classes = Column(String(1000), nullable=False)  # stored as a stringified list
    subjects = Column(String(1000), nullable=False)  # stored as a stringified list
    hours_per_day = Column(Integer, nullable=False)

# Teachers and their availability
class Teachers(Base):
    __tablename__ = 'Teachers'
    Tid = Column(Integer, primary_key=True)
    Uid = Column(Integer, nullable=False)  # Uid is used as school id
    name = Column(String(128), nullable=False)
    max_hours = Column(Integer, nullable=False)

# Subjects that each teacher can teach
class TeacherSubjects(Base):
    __tablename__ = 'TeacherSubjects'
    id = Column(Integer, primary_key=True)
    Tid = Column(Integer, nullable=False)
    subject = Column(String(128), nullable=False)

# Weekly subject allocation per class
class Classes(Base):
    __tablename__ = 'Classes'
    id = Column(Integer, primary_key=True)
    Uid = Column(Integer, nullable=False)  # Uid is used as school ID
    class_name = Column(String(128), nullable=False)
    subject = Column(String(128), nullable=False)
    hours_per_week = Column(Integer, nullable=False)

# Limit how many times a subject can be taught at the same time system-wide
class SubjectParallelLimits(Base):
    __tablename__ = 'SubjectParallelLimits'
    id = Column(Integer, primary_key=True)
    Uid = Column(Integer, nullable=False)
    subject_name = Column(String(128), nullable=False)
    max_parallel = Column(Integer, nullable=False)

class PreferBlockSubjects(Base):
    __tablename__ = 'PreferBlockSubjects'
    id = Column(Integer, primary_key=True)
    Uid = Column(Integer, nullable=False)
    subject_name = Column(String(128), nullable=False)
    weight = Column(Integer, nullable=False)

# Create DB engine using URI from environment
engine = create_engine(f"mysql+pymysql://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASSWORD')}@{os.environ.get('DB_HOST')}/{os.environ.get('DB_NAME')}")

# Create all tables
Base.metadata.create_all(engine)

print("Timetable scheduler database tables created successfully.")
