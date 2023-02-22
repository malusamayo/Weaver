from datetime import datetime
import os

class StateStack:
    def __init__(self, directory="../../output/", stateSaveDirectory="savedStates/", maxStates=100):
        self.stateSaveDirectory = directory + stateSaveDirectory
        print("stateSaveDirectory: {}".format(self.stateSaveDirectory))
        self.maxStates = max(10, maxStates)
        print("maxStates: {}".format(self.maxStates))
        self.stack = self.readStateSaveDirectory()

    def readStateSaveDirectory(self):
        if not os.path.exists(self.stateSaveDirectory):
            os.makedirs(self.stateSaveDirectory)
            return []

        files = []

        for filename in os.listdir(self.stateSaveDirectory):
            if filename.startswith("state_"):
                files.append((filename, datetime.strptime(filename.replace("state_", "").replace(".csv", ""), "%Y-%m-%d_%H-%M-%S-%f")))
        files.sort(key=lambda x: x[1])

        filesToBeDeleted = []
        if len(files) > self.maxStates:
            for filename, _ in files[:len(files) - self.maxStates]:
                filesToBeDeleted.append(filename)
        
        for filename in filesToBeDeleted:
            os.remove(self.stateSaveDirectory + filename)
            print("1. removing {}".format(filename))
        
        return [filename for filename, _ in files]
        
    def addState(self, stateFileName):
        newStateFileName = "state_{}.csv".format(datetime.now().strftime("%Y-%m-%d_%H-%M-%S-%f")) 
        print("making copy of {} to {}".format(stateFileName, self.stateSaveDirectory + newStateFileName))
        self.copyFile(stateFileName, self.stateSaveDirectory + newStateFileName)
        self.stack.append(newStateFileName)
        print("self.stack: {}".format(self.stack))
        filesToBeDeleted = []
        if len(self.stack) > self.maxStates:
            for filename in self.stack[:len(self.stack) - self.maxStates]:
                filesToBeDeleted.append(filename)
            self.stack = self.stack[len(filesToBeDeleted):]
        for filename in filesToBeDeleted:
            os.remove(self.stateSaveDirectory + filename)
            print("2. removing {}".format(filename))

    def copyFile(self, src, dst):
        with open(src, "r") as f:
            content = f.read()
        with open(dst, "w") as f:
            f.write(content)

    def getLatestState(self):
        if len(self.stack) == 0:
            return (None, None)

        print("self.stack: {}".format(self.stack))
        latestState = self.stack[-1]
        return (self.stateSaveDirectory, latestState)

    def deleteLatestState(self):
        if len(self.stack) == 0:
            return
        
        latestState = self.stack.pop()
        print("Stack: {}".format(self.stack))
        os.remove(self.stateSaveDirectory + latestState)
        print("3. removing {}".format(latestState))