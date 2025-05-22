# Use the official Python 3.11 Docker image as the base
FROM python:3.11

# Set the working directory inside the container to /app
WORKDIR /app

# Copy all files from the current directory (your project folder) into the /app directory inside the container
COPY . .

# Install all Python dependencies from the requirements.txt file
RUN pip install -r requirements.txt 

# Execute both Python scripts sequentially:
# 'sh' starts a shell, '-c' allows executing a command as a string.
# The command "python create_tables.py && python app.py" runs inside the shell.
# The second script will only start if the first one completes successfully.
CMD ["sh", "-c", "python create_tables.py && python app.py"]

