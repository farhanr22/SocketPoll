# A base class for all voting-related errors
class VotingError(Exception):
    pass

# Specific errors that inherit from the base class
class PollNotFoundError(VotingError):
    pass

class PollClosedError(VotingError):
    pass

class AlreadyVotedError(VotingError):
    pass

class InvalidOptionsError(VotingError):
    pass