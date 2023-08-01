'''
Hello and welcome to Tasket. 

This is a simple python based app I developed to more easily deal with tasks.

There is an influx of apps like Notion which can complicate a simple todolist throughout the day.

This is a basic app that writes to txt files so users can see what was accomplished on what day.

There is basic documentation for each function below.
'''



import os
import datetime

#Provides a clear terminal after commands

def clear_terminal():
    os.system('clear' if os.name == 'posix' else 'cls')

#Shows numbered tasks

def display_tasks(in_progress_tasks, finished_tasks):
    print("In Progress:")
    if not in_progress_tasks:
        print("No tasks")
    else:
        for i, task in enumerate(in_progress_tasks, 1):
            print(f"{i}. {task}")
    print("\nFinished:")
    if not finished_tasks:
        print("No tasks")
    else:
        for i, task in enumerate(finished_tasks, 1):
            print(f"{i}. {task}")

#File i/o to either create or read from a txt file in the same folder

def read_tasks(file_path):
    in_progress_tasks = []
    finished_tasks = []
    current_list = None

    if not os.path.exists(file_path):
        return in_progress_tasks, finished_tasks

    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            if line == "In Progress:":
                current_list = in_progress_tasks
            elif line == "Finished:":
                current_list = finished_tasks
            elif current_list is not None and line != "":
                current_list.append(line)

    return in_progress_tasks, finished_tasks

#Adds tasks to either progress or finished section of txt file

def update_tasks(file_path, in_progress_tasks, finished_tasks):
    with open(file_path, 'w') as file:
        file.write("In Progress:\n")
        file.write('\n'.join(in_progress_tasks))
        file.write("\n\nFinished:\n")
        file.write('\n'.join(finished_tasks))

#Allows for users to edit a certain task based on the selected task number

def edit_task(tasks_list, task_number):
    if 0 <= task_number < len(tasks_list):
        current_task = tasks_list[task_number]
        tasks_list[task_number] = input("Edit task: ")
        return True

    return False

#Deals with all the input based commands before calling other functions

def main():
    today = datetime.date.today()
    file_name = str(today) + ".txt"
    in_progress_tasks, finished_tasks = read_tasks(file_name)

    while True:
        clear_terminal()

        print("Welcome to TASKET")
        print("Enter 'new' to add a task")
        print("Enter 'done' followed by the task number to finish a task")
        print("Enter 'del prog' followed by the task number to delete an in-progress task")
        print("Enter 'del fin' followed by the task number to delete a finished task")
        print("Enter 'edit prog' followed by the task number to edit an in-progress task")
        print("Enter 'edit fin' followed by the task number to edit a finished task")
        print("Enter 'open' followed by a date (YYYY-MM-DD) to open a specific list")
        print("Enter 'show' to display the current tasks")
        print("Enter 'exit' to quit")
        print()

        display_tasks(in_progress_tasks, finished_tasks)

        command = input(">> ")
        if command == "new":
            task = input("Enter task: ")
            in_progress_tasks.append(task)
            update_tasks(file_name, in_progress_tasks, finished_tasks)
        elif command.startswith("done"):
            task_number_str = command.split()[1]
            if task_number_str.isdigit():
                task_number = int(task_number_str) - 1
                if 0 <= task_number < len(in_progress_tasks):
                    finished_task = in_progress_tasks.pop(task_number)
                    finished_tasks.append(finished_task)
                    update_tasks(file_name, in_progress_tasks, finished_tasks)
                else:
                    print("Invalid task number.")
            else:
                print("Invalid input. Please enter a valid task number.")
        elif command.startswith("del"):
            sub_command, task_number_str = command.split()[1:]
            if task_number_str.isdigit():
                task_number = int(task_number_str) - 1
                if sub_command == "prog":
                    if 0 <= task_number < len(in_progress_tasks):
                        in_progress_tasks.pop(task_number)
                        update_tasks(file_name, in_progress_tasks, finished_tasks)
                    else:
                        print("Invalid task number.")
                elif sub_command == "fin":
                    if 0 <= task_number < len(finished_tasks):
                        finished_tasks.pop(task_number)
                        update_tasks(file_name, in_progress_tasks, finished_tasks)
                    else:
                        print("Invalid task number.")
                else:
                    print("Invalid sub-command. Please use 'prog' or 'fin'.")
            elif task_number_str == "":
                print("Assuming 0. No tasks deleted.")
            else:
                print("Invalid input. Please enter a valid task number.")
        elif command.startswith("edit"):
            sub_command, task_number_str = command.split()[1:]
            if task_number_str.isdigit():
                task_number = int(task_number_str) - 1
                if sub_command == "prog":
                    if edit_task(in_progress_tasks, task_number):
                        update_tasks(file_name, in_progress_tasks, finished_tasks)
                elif sub_command == "fin":
                    if edit_task(finished_tasks, task_number):
                        update_tasks(file_name, in_progress_tasks, finished_tasks)
                else:
                    print("Invalid command. Please enter 'edit prog' or 'edit fin' followed by a task number.")
            else:
                print("Invalid input. Please enter a valid task number.")
        elif command.startswith("open"):
            file_name = command.split()[1] + ".txt"
            in_progress_tasks, finished_tasks = read_tasks(file_name)
        elif command == "show":
            input("Press Enter to continue...")
        elif command == "exit":
            break
        else:
            print("Invalid command.")

if __name__ == "__main__":
    main()
