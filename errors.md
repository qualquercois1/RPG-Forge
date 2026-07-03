   127.0.0.1:64542 - "GET /api/characters HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 415, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 62, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 96, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 154, in simple_response
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 2683, in app
    await route.handle(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 1266, in handle
    await super().handle(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 150, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 136, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 690, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 346, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\to_thread.py", line 63, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        func, args, abandon_on_cancel=abandon_on_cancel, limiter=limiter
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2596, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1029, in run
    result = context.run(func, *args)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\main.py", line 126, in get_characters
    cursor.execute("""
    ~~~~~~~~~~~~~~^^^^
        SELECT c.id, c.user_id, c.table_id, c.name, c.classe, c.level, c.race, c.region, c.age, c.height, c.physical, c.color, c.lore,
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
        WHERE c.user_id = ?
        ^^^^^^^^^^^^^^^^^^^
    """, (int(x_user_id),))
    ^^^^^^^^^^^^^^^^^^^^^^^
sqlite3.OperationalError: no such column: c.table_id
INFO:     127.0.0.1:55954 - "POST /api/characters HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 415, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 62, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 96, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 154, in simple_response
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 2683, in app
    await route.handle(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 1266, in handle
    await super().handle(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 150, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 136, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 690, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\fastapi\routing.py", line 346, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\to_thread.py", line 63, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        func, args, abandon_on_cancel=abandon_on_cancel, limiter=limiter
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2596, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1029, in run
    result = context.run(func, *args)
  File "C:\Users\cassi\Documents\programing\Projects\RPG-Forge\backend\main.py", line 173, in create_character
    cursor.execute("""
    ~~~~~~~~~~~~~~^^^^
        INSERT INTO characters (
        ^^^^^^^^^^^^^^^^^^^^^^^^
    ...<5 lines>...
        char.strength, char.agi, char.intel, char.vit, char.sur, char.mag
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ))
    ^^
sqlite3.OperationalError: table characters has no column named table_id
